import { notFound } from "next/navigation";
import { createServiceRoleSupabaseClient } from "@/lib/supabase/server";
import { QuestionWizard } from "@/components/diagnose/QuestionWizard";

export default async function DraftPage({
  params,
}: {
  params: Promise<{ draftId: string }>;
}) {
  const { draftId } = await params;
  const supabase = createServiceRoleSupabaseClient();
  const { data: draft } = await supabase
    .from("assessment_drafts")
    .select("current_step")
    .eq("id", draftId)
    .maybeSingle();

  if (!draft) {
    notFound();
  }

  return <QuestionWizard draftId={draftId} initialStep={draft.current_step} />;
}
