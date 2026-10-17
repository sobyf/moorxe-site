import { z } from "zod";

/**
 * Shared contact-form validation, used by both the client form and the
 * `/api/contact` route handler so both sides enforce the same contract.
 */
export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Please enter your name.")
    .max(120, "Please keep your name under 120 characters."),
  email: z
    .string()
    .trim()
    .min(1, "Please enter your email address.")
    .max(254, "Please keep your email address under 254 characters.")
    .email("Please enter a valid email address."),
  message: z
    .string()
    .trim()
    .min(10, "Please describe your task in at least 10 characters.")
    .max(5000, "Please keep your message under 5000 characters."),
  /**
   * Honeypot field. Real users never fill it (it is hidden from sighted
   * users, screen readers, and keyboard navigation). Submissions with a
   * non-empty value are treated as automated spam.
   */
  company: z.string().max(200).optional().default(""),
});

export type ContactInput = z.infer<typeof contactSchema>;

/** Field-level error map returned to the client. */
export function toFieldErrors(error: z.ZodError): Record<string, string> {
  const fields: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "message");
    if (!fields[key]) fields[key] = issue.message;
  }
  return fields;
}
