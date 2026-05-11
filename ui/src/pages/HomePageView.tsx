import { useMemo, useState, useEffect } from "react";
import type { Article } from "../interfaces/Article";
import ArticleCard from "../components/ArticleCard";
import "./HomePageView.css";

interface Author {
  name: string;
  url: string;
  categories: string[];
}

const getSmartSourceURL = (url: string): string => {
  try {
    const urlObject = new URL(url);
    const hostname = urlObject.hostname;
    const pathParts = urlObject.pathname.split("/").filter(Boolean);

    if (hostname.includes("github.com") || hostname.includes("gitlab.com")) {
      if (pathParts.length >= 2) {
        return `${urlObject.protocol}//${hostname}/${pathParts[0]}/${pathParts[1]}`;
      }
    }

    if (hostname.includes("medium.com") || hostname.includes("dev.to")) {
      if (pathParts.length > 0 && pathParts[0].startsWith("@")) {
        return `${urlObject.protocol}//${hostname}/${pathParts[0]}`;
      }
    }
    
    return urlObject.origin;
  } catch (e) {
    console.warn(`Could not parse URL for smart source URL: ${url}`, e);
    return "#";
  }
};

function HomePageView({
  articles,
  loading,
  error,
  activeTab,
  setActiveTab,
}: {
  articles: Article[];
  loading: boolean;
  error: string | null;
  activeTab: "authors" | "articles";
  setActiveTab: React.Dispatch<React.SetStateAction<"authors" | "articles">>;
}) {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const { categories, authors } = useMemo(() => {
    const allCategories = new Set<string>();
    const authorData: { [key: string]: { url: string; categories: Set<string> } } = {};

    articles.forEach((article) => {
      const articleCategories = article.category ? article.category.split(",").map((c) => c.trim()) : [];
      articleCategories.forEach((cat) => allCategories.add(cat));

      if (!authorData[article.author]) {
        authorData[article.author] = {
          url: getSmartSourceURL(article.url),
          categories: new Set(),
        };
      }
      articleCategories.forEach((cat) => authorData[article.author].categories.add(cat));
    });

    const finalAuthors: Author[] = Object.entries(authorData).map(([name, data]) => ({
      name,
      url: data.url,
      categories: Array.from(data.categories),
    }));

    return {
      categories: ["All", ...Array.from(allCategories).sort()],
      authors: finalAuthors,
    };
  }, [articles]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const filteredArticles = useMemo(() => {
    return articles
      .filter((article) => {
        const categoryMatch =
          activeCategory === "All" ||
          (article.category && article.category.split(",").map((c) => c.trim()).includes(activeCategory));

        const searchMatch =
          !debouncedSearchTerm ||
          article.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          article.author.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          (article.category &&
            article.category.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));
        
        return categoryMatch && searchMatch;
      })
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [articles, activeCategory, debouncedSearchTerm]);

  const filteredAuthors = useMemo(() => {
    return authors
      .filter((author) => {
        const categoryMatch =
          activeCategory === "All" || author.categories.includes(activeCategory);

        const searchMatch =
          !debouncedSearchTerm ||
          author.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
        
        return categoryMatch && searchMatch;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [authors, activeCategory, debouncedSearchTerm]);

  return (
    <>
      <nav className="tabs">
        <button className={activeTab === "authors" ? "active" : ""} onClick={() => setActiveTab("authors")}>
          Authors
        </button>
        <button className={activeTab === "articles" ? "active" : ""} onClick={() => setActiveTab("articles")}>
          Articles
        </button>
      </nav>

      <div className="filters-container">
        <div className="search-bar-container">
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="category-filters">
          {categories.map((category) => (
            <button
              key={category}
              className={`category-pill ${activeCategory === category ? "active" : ""}`}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <main className="app-main">
        {loading && <p className="loading-message">Loading from your Shelf...</p>}
        {error && <p className="error-message">{error}</p>}

        {!loading && !error && (
          <>
            {activeTab === "authors" && (
              <div className="content-list">
                {filteredAuthors.length === 0 ? (
                  <p>No authors found.</p>
                ) : (
                  filteredAuthors.map((site, index) => (
                    <ArticleCard
                      key={index}
                      article={{
                        url: site.url,
                        title: site.name,
                        author: '',
                        category: site.categories.join(', ')
                      }}
                    />
                  ))
                )}
              </div>
            )}
            {activeTab === "articles" && (
              <div className="content-list">
                {filteredArticles.length === 0 ? (
                  <p>No articles found.</p>
                ) : (
                  filteredArticles.map((article, index) => (
                    <ArticleCard key={index} article={article} />
                  ))
                )}
              </div>
            )}
          </>
        )}
      </main>
    </>
  );
}

export default HomePageView;
