import { z } from "zod";

export const submitConsultingRequestSchema = z.object({
  preferredContact: z.string().min(1),
  message: z.string().optional(),
});

export type SubmitConsultingRequestPayload = z.infer<
  typeof submitConsultingRequestSchema
>;
