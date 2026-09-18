import { z } from "zod";

export const createOperatorSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["owner", "staff"]),
});

export type CreateOperatorPayload = z.infer<typeof createOperatorSchema>;
