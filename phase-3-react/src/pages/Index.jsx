import { useArticles } from "@/hooks/useArticles";
import ArticleSection from "@/components/ArticleSection";
import UpdateButton from "@/components/UpdateButton";
import LaravelIcon from "@/components/LaravelIcon";
import NodeJsIcon from "@/components/NodeJsIcon";
import { ArrowDown } from "lucide-react";

const Index = () => {
  const {
    originalArticles,
    updatedArticles,
    isLoadingOriginal,
    isLoadingUpdate,
    hasUpdated,
    handleUpdate,
  } = useArticles();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                Article<span className="text-red-600">Hub</span>
              </h1>
              <p className="text-sm text-gray-600 mt-0.5">
                Laravel to Node.js Article Transformer
              </p>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="px-3 py-1.5 bg-red-100 rounded-md text-red-600 font-medium">
                Laravel API
              </span>
              <ArrowDown className="w-4 h-4 text-gray-400" />
              <span className="px-3 py-1.5 bg-green-100 rounded-md text-green-700 font-medium">
                Node.js
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <ArticleSection
          variant="laravel"
          title="Laravel"
          subtitle="Original articles from Laravel API"
          icon={<LaravelIcon className="w-8 h-8 text-white" />}
          articles={originalArticles}
          isLoading={isLoadingOriginal}
          emptyMessage="No original articles found"
        />

        <div className="flex justify-center py-4">
          <UpdateButton
            onClick={handleUpdate}
            isLoading={isLoadingUpdate}
            disabled={isLoadingOriginal}
          />
        </div>

        {(hasUpdated || isLoadingUpdate) && (
          <ArticleSection
            variant="nodejs"
            title="Node.js"
            subtitle="Updated articles transformed for Node.js ecosystem"
            icon={<NodeJsIcon className="w-8 h-8 text-white" />}
            articles={updatedArticles}
            isLoading={isLoadingUpdate}
            emptyMessage="Click update to fetch Node.js articles"
          />
        )}

        {!hasUpdated && !isLoadingUpdate && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-sm">
              Click the <span className="text-green-700 font-semibold">Update Articles</span> button 
              to fetch the Node.js version of these articles
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;