import { z } from "zod";

// Requests are answered at the diagnosis email. An anonymous diagnosis has
// none, so its consult form collects `contact` (with privacy consent) instead.
export const submitConsultingRequestSchema = z.object({
  message: z.string().optional(),
  contact: z
    .object({
      name: z.string().min(1),
      email: z.string().email(),
      privacyConsent: z.literal(true),
    })
    .optional(),
});

export type SubmitConsultingRequestPayload = z.infer<
  typeof submitConsultingRequestSchema
>;
