import { z } from "zod";

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8),
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "새 비밀번호가 현재 비밀번호와 같습니다.",
    path: ["newPassword"],
  });

export type ChangePasswordPayload = z.infer<typeof changePasswordSchema>;
