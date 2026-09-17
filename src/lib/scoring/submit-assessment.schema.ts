import { z } from "zod";

const answerScore = z.number().int().min(1).max(5);
const layerAnswers = z.tuple([answerScore, answerScore, answerScore, answerScore]);

export const businessStageSchema = z.enum([
  "idea",
  "mvp_prep",
  "building",
  "operating",
  "growth",
  "realign",
]);

export const submitAssessmentSchema = z.object({
  basicInfo: z.object({
    name: z.string().min(1),
    email: z.string().email(),
    companyName: z.string().optional(),
    role: z.string().optional(),
    businessStage: businessStageSchema,
    industry: z.string().optional(),
    teamSize: z.string().optional(),
  }),
  answers: z.object({
    value: layerAnswers,
    customer: layerAnswers,
    offer: layerAnswers,
    experience: layerAnswers,
    process: layerAnswers,
    data: layerAnswers,
    scale: layerAnswers,
  }),
  marketingConsent: z.boolean(),
  utm: z
    .object({
      source: z.string().optional(),
      medium: z.string().optional(),
      campaign: z.string().optional(),
    })
    .optional(),
});

export type SubmitAssessmentPayload = z.infer<typeof submitAssessmentSchema>;
