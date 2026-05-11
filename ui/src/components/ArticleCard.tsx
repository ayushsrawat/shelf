import "./ArticleCard.css";
import type { Article } from "../interfaces/Article";

interface ArticleCardProps {
  article: Article;
}

function ArticleCard({ article }: ArticleCardProps) {
  const categories = article.category ? article.category.split(",").map((c) => c.trim()) : [];

  return (
    <a href={article.url} target="_blank" rel="noopener noreferrer" className="article-card-link">
      <div className="article-card-content">
        <h3>{article.title}</h3>
      </div>
      <div className="article-card-footer">
        {article.author && <p className="author-name">{article.author}</p>}
        {categories.slice(0, 2).map((category, index) => (
          <span key={index} className="category-badge">
            {category}
          </span>
        ))}
        {categories.length > 2 && (
          <span className="category-badge">+{categories.length - 2}</span>
        )}
      </div>
    </a>
  );
}

export default ArticleCard;
