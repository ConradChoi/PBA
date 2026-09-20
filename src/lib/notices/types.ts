export type NoticeRow = {
  id: string;
  title: string;
  body_html: string;
  is_published: boolean;
  published_at: string | null;
  is_important: boolean;
  important_until: string | null;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
};
