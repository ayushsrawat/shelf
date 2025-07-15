import type { Article } from "../interfaces/Article";
import "./ArticleCard.css";

interface ArticleCardProps {
  article: Article;
}

function ArticleCard({ article }: ArticleCardProps) {
  return (
    <a href={article.url} target="_blank" rel="noopener noreferrer" className="article-card-link">
      <div className="article-card-content">
        {" "}
        {/* Wrap content in a div for styling */}
        <h3>{article.title}</h3>
        <p className="website-name">{article.website}</p>
      </div>
    </a>
  );
}

export default ArticleCard;
