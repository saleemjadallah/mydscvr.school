import { Newspaper, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import type { SchoolNewsResponse, ExaArticle } from "@/types";

const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

async function fetchNews(slug: string): Promise<SchoolNewsResponse | null> {
  try {
    const res = await fetch(`${BASE_URL}/api/schools/${slug}/news`, {
      next: { revalidate: 1800 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function SchoolNews({ slug }: { slug: string }) {
  const data = await fetchNews(slug);

  if (!data || data.articles.length === 0) return null;

  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <Newspaper className="size-5 text-[#FF6B35]" />
        <h2 className="text-lg font-semibold text-gray-900">In the News</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data.articles.slice(0, 6).map((article: ExaArticle) => (
          <Card
            key={article.url}
            className="group flex flex-col justify-between overflow-hidden p-4 transition-shadow hover:shadow-md"
          >
            <div>
              {/* Title */}
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mb-2 block text-sm font-semibold leading-snug text-gray-900 line-clamp-2 group-hover:text-[#FF6B35]"
              >
                {article.title ?? "Untitled"}
              </a>

              {/* Highlight snippet */}
              {article.highlights && article.highlights[0] && (
                <p className="mb-3 text-xs leading-relaxed text-gray-500 line-clamp-3">
                  {article.highlights[0]}
                </p>
              )}
            </div>

            {/* Footer: source + date + author */}
            <div className="flex items-center justify-between text-[11px] text-gray-400">
              <div className="flex items-center gap-1.5 truncate">
                <span className="font-medium text-gray-500">
                  {article.source}
                </span>
                {article.publishedDate && (
                  <>
                    <span>&middot;</span>
                    <span>
                      {new Date(article.publishedDate).toLocaleDateString(
                        "en-GB",
                        { day: "numeric", month: "short", year: "numeric" }
                      )}
                    </span>
                  </>
                )}
                {article.author && (
                  <>
                    <span>&middot;</span>
                    <span className="truncate">{article.author}</span>
                  </>
                )}
              </div>
              <ExternalLink className="size-3 flex-shrink-0 text-gray-300 group-hover:text-[#FF6B35]" />
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
