import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { contactSchema, toFieldErrors } from "@/lib/contact-schema";
import {
  deliverSubmission,
  DeliveryUnavailableError,
} from "@/lib/contact-delivery";

const MAX_BODY_BYTES = 32 * 1024;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;

/** In-process per-IP timestamps. Not durable or shared across instances. */
const requestLog = new Map<string, number[]>();

function clientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entries = (requestLog.get(ip) ?? []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS,
  );
  entries.push(now);
  requestLog.set(ip, entries);
  // Bound memory: drop idle buckets opportunistically.
  if (requestLog.size > 5000) {
    for (const [key, times] of requestLog) {
      if (times.length === 0 || now - times[times.length - 1] > RATE_LIMIT_WINDOW_MS) {
        requestLog.delete(key);
      }
    }
  }
  return entries.length > RATE_LIMIT_MAX;
}

export async function POST(request: NextRequest) {
  const ip = clientIp(request);

  const rawBody = await request.text();
  if (new TextEncoder().encode(rawBody).length > MAX_BODY_BYTES) {
    return NextResponse.json(
      { error: "too_large", message: "Your message is too large. Please shorten it and try again." },
      { status: 413 },
    );
  }

  let payload: unknown;
  try {
    payload = rawBody ? JSON.parse(rawBody) : {};
  } catch {
    return NextResponse.json(
      { error: "invalid", message: "Please send a valid message.", fields: {} },
      { status: 400 },
    );
  }

  const parsed = contactSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "invalid",
        message: "Please review the highlighted fields.",
        fields: toFieldErrors(parsed.error),
      },
      { status: 400 },
    );
  }

  // Honeypot: automated spam gets a quiet acknowledgement without storage.
  if (parsed.data.company.trim() !== "") {
    return NextResponse.json({ status: "ok" });
  }

  if (isRateLimited(ip)) {
    return NextResponse.json(
      {
        error: "rate_limited",
        message: "You have sent several messages recently. Please wait a little while and try again.",
      },
      { status: 429 },
    );
  }

  try {
    const receipt = await deliverSubmission(parsed.data);
    return NextResponse.json({ status: "ok", receipt: receipt.note });
  } catch (error) {
    if (error instanceof DeliveryUnavailableError) {
      return NextResponse.json(
        { error: "unavailable", message: error.message },
        { status: error.status },
      );
    }
    return NextResponse.json(
      { error: "failed", message: "We couldn't send your message. Please try again." },
      { status: 500 },
    );
  }
}
