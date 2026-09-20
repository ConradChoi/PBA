import { createServiceRoleSupabaseClient } from "../supabase/server";
import type { NoticeRow } from "./types";

export type NoticeInput = {
  title: string;
  bodyHtml: string;
  isPublished: boolean;
  isImportant: boolean;
  importantUntil: string | null;
  operatorEmail: string;
};

export async function listNotices(): Promise<NoticeRow[]> {
  const supabase = createServiceRoleSupabaseClient();
  const { data, error } = await supabase
    .from("notices")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as NoticeRow[];
}

export async function listPublishedNotices(): Promise<NoticeRow[]> {
  const supabase = createServiceRoleSupabaseClient();
  const { data, error } = await supabase
    .from("notices")
    .select("*")
    .eq("is_published", true)
    .order("published_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as NoticeRow[];
}

export async function getNoticeById(id: string): Promise<NoticeRow | null> {
  const supabase = createServiceRoleSupabaseClient();
  const { data, error } = await supabase
    .from("notices")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as NoticeRow | null;
}

export async function getPublishedNoticeById(id: string): Promise<NoticeRow | null> {
  const supabase = createServiceRoleSupabaseClient();
  const { data, error } = await supabase
    .from("notices")
    .select("*")
    .eq("id", id)
    .eq("is_published", true)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as NoticeRow | null;
}

export async function createNotice(input: NoticeInput): Promise<string> {
  const supabase = createServiceRoleSupabaseClient();
  const { data, error } = await supabase
    .from("notices")
    .insert({
      title: input.title,
      body_html: input.bodyHtml,
      is_published: input.isPublished,
      published_at: input.isPublished ? new Date().toISOString() : null,
      is_important: input.isImportant,
      important_until: input.importantUntil,
      created_by: input.operatorEmail,
      updated_by: input.operatorEmail,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data.id as string;
}

export async function updateNotice(id: string, input: NoticeInput): Promise<void> {
  const supabase = createServiceRoleSupabaseClient();

  // published_at marks when the notice first went public and orders both the
  // list and the banner, so an edit must not move it.
  const { data: existing, error: readError } = await supabase
    .from("notices")
    .select("published_at")
    .eq("id", id)
    .maybeSingle();

  if (readError) {
    throw new Error(readError.message);
  }

  const existingPublishedAt = (existing?.published_at as string | null) ?? null;
  const publishedAt = input.isPublished
    ? (existingPublishedAt ?? new Date().toISOString())
    : existingPublishedAt;

  const { error } = await supabase
    .from("notices")
    .update({
      title: input.title,
      body_html: input.bodyHtml,
      is_published: input.isPublished,
      published_at: publishedAt,
      is_important: input.isImportant,
      important_until: input.importantUntil,
      updated_by: input.operatorEmail,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteNotice(id: string): Promise<void> {
  const supabase = createServiceRoleSupabaseClient();
  const { error } = await supabase.from("notices").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}
