import { z } from "zod";

export const answerScoreSchema = z.number().int().min(1).max(5);
export const layerAnswerSetSchema = z.tuple([
  answerScoreSchema,
  answerScoreSchema,
  answerScoreSchema,
  answerScoreSchema,
]);

export const businessStageSchema = z.enum([
  "idea",
  "mvp_prep",
  "building",
  "operating",
  "growth",
  "realign",
]);

export const layerIdSchema = z.enum([
  "value",
  "customer",
  "offer",
  "experience",
  "process",
  "data",
  "scale",
]);

export const basicInfoSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  companyName: z.string().optional(),
  role: z.string().optional(),
  businessStage: businessStageSchema,
  industry: z.string().optional(),
  teamSize: z.string().optional(),
});

const utmSchema = z
  .object({
    source: z.string().optional(),
    medium: z.string().optional(),
    campaign: z.string().optional(),
  })
  .optional();

export const draftBasicInfoSchema = z.object({
  basicInfo: basicInfoSchema,
  privacyConsent: z.literal(true),
  marketingConsent: z.boolean(),
  utm: utmSchema,
});

export const submitAssessmentSchema = draftBasicInfoSchema.extend({
  answers: z.object({
    value: layerAnswerSetSchema,
    customer: layerAnswerSetSchema,
    offer: layerAnswerSetSchema,
    experience: layerAnswerSetSchema,
    process: layerAnswerSetSchema,
    data: layerAnswerSetSchema,
    scale: layerAnswerSetSchema,
  }),
});

export const patchDraftAnswersSchema = z.object({
  layerId: layerIdSchema,
  answers: layerAnswerSetSchema,
});

export type SubmitAssessmentPayload = z.infer<typeof submitAssessmentSchema>;
export type DraftBasicInfoPayload = z.infer<typeof draftBasicInfoSchema>;
export type PatchDraftAnswersPayload = z.infer<typeof patchDraftAnswersSchema>;
