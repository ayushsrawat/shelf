import { useMemo, useState, useEffect } from "react";
import type { Article } from "../interfaces/Article";
import ArticleCard from "../components/ArticleCard";
import "./HomePageView.css";

interface Website {
  name: string;
  url: string;
  categories: string[];
}

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
  activeTab: "websites" | "articles";
  setActiveTab: React.Dispatch<React.SetStateAction<"websites" | "articles">>;
}) {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const { categories, websites } = useMemo(() => {
    const allCategories = new Set<string>();
    const websiteData: { [key: string]: { url: string; categories: Set<string> } } = {};

    articles.forEach((article) => {
      const articleCategories = article.category ? article.category.split(",").map((c) => c.trim()) : [];
      articleCategories.forEach((cat) => allCategories.add(cat));

      if (!websiteData[article.website]) {
        try {
          websiteData[article.website] = {
            url: new URL(article.url).origin,
            categories: new Set(),
          };
        } catch (e) {
          console.warn(`Could not parse URL for website: ${article.website}`, e);
          websiteData[article.website] = { url: "#", categories: new Set() };
        }
      }
      articleCategories.forEach((cat) => websiteData[article.website].categories.add(cat));
    });

    const finalWebsites: Website[] = Object.entries(websiteData).map(([name, data]) => ({
      name,
      url: data.url,
      categories: Array.from(data.categories),
    }));

    return {
      categories: ["All", ...Array.from(allCategories).sort()],
      websites: finalWebsites,
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
          article.website.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
          (article.category &&
            article.category.toLowerCase().includes(debouncedSearchTerm.toLowerCase()));
        
        return categoryMatch && searchMatch;
      })
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [articles, activeCategory, debouncedSearchTerm]);

  const filteredWebsites = useMemo(() => {
    return websites
      .filter((website) => {
        const categoryMatch =
          activeCategory === "All" || website.categories.includes(activeCategory);

        const searchMatch =
          !debouncedSearchTerm ||
          website.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
        
        return categoryMatch && searchMatch;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [websites, activeCategory, debouncedSearchTerm]);

  return (
    <>
      <nav className="tabs">
        <button className={activeTab === "websites" ? "active" : ""} onClick={() => setActiveTab("websites")}>
          Websites
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
            {activeTab === "websites" && (
              <div className="content-list">
                {filteredWebsites.length === 0 ? (
                  <p>No websites found.</p>
                ) : (
                  filteredWebsites.map((site, index) => (
                    <ArticleCard
                      key={index}
                      article={{
                        url: site.url,
                        title: site.name,
                        website: '',
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
