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
  "other",
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

export const basicInfoSchema = z
  .object({
    // Collected only with privacy consent; see withConsentRules below.
    name: z.string().min(1).optional(),
    email: z.string().email().optional(),
    companyName: z.string().optional(),
    role: z.string().optional(),
    businessStage: businessStageSchema,
    businessStageOther: z.string().optional(),
    industry: z.string().optional(),
    teamSize: z.string().optional(),
  })
  .refine(
    (data) => data.businessStage !== "other" || !!data.businessStageOther?.trim(),
    {
      message: "사업 단계를 '기타'로 선택한 경우 직접 입력해주세요.",
      path: ["businessStageOther"],
    }
  );

const utmSchema = z
  .object({
    source: z.string().optional(),
    medium: z.string().optional(),
    campaign: z.string().optional(),
  })
  .optional();

const draftBasicInfoFields = z.object({
  basicInfo: basicInfoSchema,
  privacyConsent: z.boolean(),
  marketingConsent: z.boolean(),
  utm: utmSchema,
});

type ConsentFields = z.infer<typeof draftBasicInfoFields>;

// Privacy consent is optional (anonymous diagnosis). With it, name and email
// are required; without it, personal fields are dropped server-side and
// marketing consent is forced off, since there's no address to market to.
function withConsentRules<S extends z.ZodType<ConsentFields, z.ZodTypeDef, unknown>>(
  schema: S
) {
  return schema
    .superRefine((data, ctx) => {
      if (!data.privacyConsent) return;
      if (!data.basicInfo.name) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["basicInfo", "name"], message: "Required" });
      }
      if (!data.basicInfo.email) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ["basicInfo", "email"], message: "Required" });
      }
    })
    .transform((data): z.infer<S> => {
      if (data.privacyConsent) return data as z.infer<S>;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { name, email, companyName, role, ...rest } = data.basicInfo;
      return { ...data, basicInfo: rest, marketingConsent: false } as z.infer<S>;
    });
}

export const draftBasicInfoSchema = withConsentRules(draftBasicInfoFields);

export const submitAssessmentSchema = withConsentRules(draftBasicInfoFields.extend({
  answers: z.object({
    value: layerAnswerSetSchema,
    customer: layerAnswerSetSchema,
    offer: layerAnswerSetSchema,
    experience: layerAnswerSetSchema,
    process: layerAnswerSetSchema,
    data: layerAnswerSetSchema,
    scale: layerAnswerSetSchema,
  }),
}));

export const patchDraftAnswersSchema = z.object({
  layerId: layerIdSchema,
  answers: layerAnswerSetSchema,
});

export type SubmitAssessmentPayload = z.infer<typeof submitAssessmentSchema>;
export type DraftBasicInfoPayload = z.infer<typeof draftBasicInfoSchema>;
export type PatchDraftAnswersPayload = z.infer<typeof patchDraftAnswersSchema>;
