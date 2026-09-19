import { z } from "zod";

// No contact field: requests are answered at the diagnosis email.
export const submitConsultingRequestSchema = z.object({
  message: z.string().optional(),
});

export type SubmitConsultingRequestPayload = z.infer<
  typeof submitConsultingRequestSchema
>;
