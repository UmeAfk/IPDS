export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

export function matchSlug(project: { title: string }, slug: string): boolean {
  return slugify(project.title) === slug;
}
