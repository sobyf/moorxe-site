import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import type { ContactInput } from "./contact-schema";

export type DeliveryMode = "local-file" | "webhook";

export class DeliveryUnavailableError extends Error {
  readonly status = 503;
  constructor(message: string) {
    super(message);
    this.name = "DeliveryUnavailableError";
  }
}

/**
 * Resolve which durable sink should receive contact submissions.
 *
 * - `CONTACT_SINK=local-file` persists to an append-only JSONL file outside
 *   `public/` (see below). This is genuine local receipt for single-instance
 *   development only: it is not shared or durable on ephemeral or
 *   multi-instance hosting, so it is refused in production.
 * - `CONTACT_SINK=webhook` POSTs the submission to `CONTACT_WEBHOOK_URL`
 *   with a bearer `CONTACT_WEBHOOK_TOKEN`.
 * - When unset, development defaults to `local-file`; production has no
 *   default and delivery is reported unavailable instead of faking success.
 */
export function resolveDeliveryMode(): DeliveryMode | null {
  const configured = process.env.CONTACT_SINK?.trim().toLowerCase();
  if (configured === "local-file" || configured === "webhook") {
    return configured;
  }
  if (configured && configured !== "") {
    throw new DeliveryUnavailableError(
      `Unknown CONTACT_SINK "${process.env.CONTACT_SINK}". Use "local-file" or "webhook".`,
    );
  }
  if (process.env.NODE_ENV === "production") return null;
  return "local-file";
}

export interface DeliveryReceipt {
  mode: DeliveryMode;
  /** Human-readable acknowledgment shown after the sink confirms receipt. */
  note: string;
}

/**
 * Whether this deployment can actually accept a submission right now.
 *
 * The contact UI uses this to mark itself unavailable instead of accepting a
 * message that no sink could store. Server-only: it reads `node:fs`-backed
 * delivery config, so never import it from a client component.
 */
export function canAcceptSubmissions(): boolean {
  let mode: DeliveryMode | null;
  try {
    mode = resolveDeliveryMode();
  } catch {
    return false;
  }
  if (mode === null) return false;
  if (mode === "local-file") return process.env.NODE_ENV !== "production";
  return Boolean(
    process.env.CONTACT_WEBHOOK_URL?.trim() &&
      process.env.CONTACT_WEBHOOK_TOKEN?.trim(),
  );
}

const LOCAL_FILE_DEV_NOTE = "Saved locally for development.";

/**
 * Persist a validated submission and return a receipt only after the sink
 * acknowledges it. Throws DeliveryUnavailableError when no sink is usable.
 * Never logs message contents to the console.
 */
export async function deliverSubmission(
  input: ContactInput,
): Promise<DeliveryReceipt> {
  const mode = resolveDeliveryMode();
  if (mode === null) {
    throw new DeliveryUnavailableError(
      "Message delivery is not configured yet. Please try again later.",
    );
  }
  if (mode === "local-file") {
    if (process.env.NODE_ENV === "production") {
      throw new DeliveryUnavailableError(
        "Local file storage is not available in production. Configure CONTACT_SINK=webhook before deploying.",
      );
    }
    const dir = path.join(process.cwd(), ".data");
    await mkdir(dir, { recursive: true });
    const record = JSON.stringify({
      receivedAt: new Date().toISOString(),
      name: input.name,
      email: input.email,
      message: input.message,
    });
    await appendFile(path.join(dir, "contact-submissions.jsonl"), record + "\n", "utf8");
    return { mode, note: LOCAL_FILE_DEV_NOTE };
  }
  const url = process.env.CONTACT_WEBHOOK_URL?.trim();
  const token = process.env.CONTACT_WEBHOOK_TOKEN?.trim();
  if (!url || !token) {
    throw new DeliveryUnavailableError(
      "Webhook delivery is not fully configured. Set CONTACT_WEBHOOK_URL and CONTACT_WEBHOOK_TOKEN.",
    );
  }
  let endpoint: URL;
  try {
    endpoint = new URL(url);
  } catch {
    throw new DeliveryUnavailableError("CONTACT_WEBHOOK_URL is not a valid URL.");
  }
  if (endpoint.protocol !== "https:") {
    throw new DeliveryUnavailableError("CONTACT_WEBHOOK_URL must use https.");
  }
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: input.name,
      email: input.email,
      message: input.message,
      receivedAt: new Date().toISOString(),
    }),
  });
  if (!response.ok) {
    throw new DeliveryUnavailableError(
      "The delivery service did not accept the message. Please try again later.",
    );
  }
  return { mode, note: "Thanks. Your message has been received." };
}
