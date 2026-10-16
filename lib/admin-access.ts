import { supabase } from "@/lib/supabase";

const SETTING_ID = "6b7ae87b-42ed-48a3-a6ad-fc76e32dc628";

// Missing settings and database failures always keep password protection enabled.
export async function requiresAdminPassword(): Promise<boolean> {
  const { data, error } = await supabase.from("site_content")
    .select("body").eq("id", SETTING_ID).maybeSingle();
  return !!error || data?.body !== "false";
}

export async function setAdminPasswordRequired(required: boolean) {
  const { error } = await supabase.from("site_content").upsert({
    id: SETTING_ID, section: "settings", title: "admin_password_required",
    body: String(required), is_active: true, sort_order: 100,
  });
  if (error) throw error;
}
