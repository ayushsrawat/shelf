import ArticleCard from "./ArticleCard";
import type { Article } from "../interfaces/Article"; // Import the Article interface
import "./TabbedContent.css";

interface TabbedContentProps {
  articles: Article[];
}

function TabbedContent({ articles }: TabbedContentProps) {
  return (
    <div className="tab-content">
      {articles.length === 0 ? (
        <p>No articles yet. Add some to get started!</p>
      ) : (
        <div className="articles-grid">
          {articles.map((article, index) => (
            <ArticleCard key={index} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}

export default TabbedContent;
