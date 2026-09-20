import { z } from "zod";

export const noticeSchema = z
  .object({
    title: z.string().min(1).max(200),
    bodyHtml: z.string().min(1),
    isPublished: z.boolean(),
    isImportant: z.boolean(),
    // Only meaningful while the notice is important; the banner hides after it.
    importantUntil: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .nullable(),
  })
  .refine((data) => !data.isImportant || data.importantUntil !== null, {
    message: "중요 공지는 표시 종료일이 필요합니다.",
    path: ["importantUntil"],
  });

export type NoticePayload = z.infer<typeof noticeSchema>;
