export function toEmbedUrl(url: string): string {
  const short = url.match(/youtu\.be\/([^?&]+)/);
  if (short) return `https://www.youtube.com/embed/${short[1]}`;
  const long = url.match(/[?&]v=([^?&]+)/);
  if (long) return `https://www.youtube.com/embed/${long[1]}`;
  return url;
}
