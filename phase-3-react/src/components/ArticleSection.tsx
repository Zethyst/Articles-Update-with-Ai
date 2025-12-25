import { type Article } from "@/types/article";
import ArticleCard from "./ArticleCard";
import SectionHeader from "./SectionHeader";
import { type ReactNode } from "react";
import { Loader2 } from "lucide-react";

interface ArticleSectionProps {
  variant: "laravel" | "nodejs";
  title: string;
  subtitle: string;
  icon: ReactNode;
  articles: Article[];
  isLoading?: boolean;
  emptyMessage?: string;
}

const ArticleSection = ({
  variant,
  title,
  subtitle,
  icon,
  articles,
  isLoading = false,
  emptyMessage = "No articles available",
}: ArticleSectionProps) => {
  const isLaravel = variant === "laravel";
  const articlesArray = Array.isArray(articles) ? articles : [];
  // console.log(articlesArray);
  return (
    <section
      className={`
        rounded-2xl p-8 md:p-10
        ${isLaravel ? "bg-red-50/30" : "bg-green-50/30"}
      `}
    >
      <SectionHeader
        variant={variant}
        title={title}
        subtitle={subtitle}
        icon={icon}
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2
            className={`w-8 h-8 animate-spin ${isLaravel ? "text-red-600" : "text-green-700"}`}
          />
        </div>
      ) : articlesArray.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          {emptyMessage}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
          {articlesArray.map((article, index) => (
            <ArticleCard
              key={article.id}
              article={article}
              variant={variant}
              index={index}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default ArticleSection;