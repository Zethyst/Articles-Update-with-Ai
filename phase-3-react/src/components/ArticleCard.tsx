import { type Article } from "@/types/article";
import { Calendar, User } from "lucide-react";

interface ArticleCardProps {
  article: Article;
  variant: "laravel" | "nodejs";
  index: number;
}

const ArticleCard = ({ article, variant, index }: ArticleCardProps) => {
  const isLaravel = variant === "laravel";

  return (
    <article
      className={`
        group relative overflow-hidden rounded-xl border-2 border-gray-200  p-6
        transition-all duration-300 ease-out
        hover:-translate-y-1 hover:shadow-xl
        ${isLaravel ? "hover:border-red-200" : "hover:border-green-200"}
         animate-fade-in
      `}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Category Badge */}
      <span
        className={`
          inline-block px-3 py-1.5 text-xs font-medium rounded-md mb-4 text-black 
          ${isLaravel 
            ? "bg-red-50 text-red-600" 
            : "bg-green-50 text-green-700"
          }
        `}
      >
        {article.category}
      </span>

      {/* Title */}
      <h3
        className="text-xl font-bold mb-3 line-clamp-2 text-gray-900 transition-colors duration-200 group-hover:text-gray-700"
      >
        {article.title}
      </h3>

      {/* Excerpt */}
      <p className="text-gray-600 text-sm mb-5 line-clamp-3 leading-relaxed">
        {article.content}
      </p>

      {/* Meta Info */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <User className="w-3.5 h-3.5" />
          {article.author}
        </span>
        <span className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          {new Date(article.published_at || "").toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      </div>
    </article>
  );
};

export default ArticleCard;