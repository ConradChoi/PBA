import { createServiceRoleSupabaseClient } from "../supabase/server";

export type ConsultingRequestRow = {
  id: string;
  assessment_id: string;
  preferred_contact: string;
  message: string | null;
  created_at: string;
  read_at: string | null;
};

export async function listConsultingRequests(): Promise<ConsultingRequestRow[]> {
  const supabase = createServiceRoleSupabaseClient();
  const { data, error } = await supabase
    .from("consulting_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as ConsultingRequestRow[];
}

export async function getConsultingRequestById(
  id: string
): Promise<ConsultingRequestRow | null> {
  const supabase = createServiceRoleSupabaseClient();
  const { data, error } = await supabase
    .from("consulting_requests")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as ConsultingRequestRow | null;
}

export async function markConsultingRequestRead(id: string): Promise<void> {
  const supabase = createServiceRoleSupabaseClient();
  const { error } = await supabase
    .from("consulting_requests")
    .update({ read_at: new Date().toISOString() })
    .eq("id", id)
    .is("read_at", null);

  if (error) {
    throw new Error(error.message);
  }
}

export async function countUnreadConsultingRequests(): Promise<number> {
  const supabase = createServiceRoleSupabaseClient();
  const { count, error } = await supabase
    .from("consulting_requests")
    .select("id", { count: "exact", head: true })
    .is("read_at", null);

  if (error) {
    throw new Error(error.message);
  }

  return count ?? 0;
}
