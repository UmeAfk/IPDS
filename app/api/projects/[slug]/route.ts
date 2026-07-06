import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: { slug: string } }) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""
  );

  const { data, error } = await supabase.from("projects").select("*").order("sort_order", { ascending: true });

  if (error || !data) {
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }

  const project = data.find(p => {
    const slug = p.title.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();
    return slug === params.slug;
  });

  if (!project || project.status !== "published") {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const { access_password, ...safe } = project;
  return NextResponse.json(safe);
}
