import { useState, useEffect } from "react";
import TabbedContent from "./components/TabbedContent";
import { getArticles } from "./utils/dataFetcher"; // Use dataFetcher
import type { Article } from "./interfaces/Article";
import "./App.css";

function App() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [activeTab, setActiveTab] = useState<"websites" | "articles">("articles");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAndSetArticles = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedArticles = await getArticles();
        setArticles(fetchedArticles);
        console.log("Articles after fetch/cache load:", fetchedArticles);
      } catch (err) {
        console.error("Failed to load articles:", err);
        setError("Failed to load articles. Please check your network or Gist URL.");
      } finally {
        setLoading(false);
      }
    };

    fetchAndSetArticles();
  }, []);

  const websiteUrls: { name: string; url: string }[] = Array.isArray(articles)
    ? Array.from(new Set(articles.map((article) => article.website))).map((websiteName) => {
        const article = articles.find((a) => a.website === websiteName);
        try {
          return { name: websiteName, url: article ? new URL(article.url).origin : "#" };
        } catch (e) {
          console.warn(`Could not parse URL for website: ${websiteName}`, e);
          return { name: websiteName, url: "#" };
        }
      })
    : [];

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>Shelf</h1>
        <nav className="tabs">
          <button className={activeTab === "websites" ? "active" : ""} onClick={() => setActiveTab("websites")}>
            Websites
          </button>
          <button className={activeTab === "articles" ? "active" : ""} onClick={() => setActiveTab("articles")}>
            Articles
          </button>
        </nav>
      </header>

      <main className="app-main">
        {loading && <p className="loading-message">Loading articles from your Shelf...</p>}
        {error && <p className="error-message">{error}</p>}

        {!loading && !error /* Ensure content renders only when not loading/error */ && (
          <>
            {activeTab === "websites" && (
              <div className="websites-list">
                {" "}
                {/* websites-list already has fadeIn animation applied */}
                <h2>Tracked Websites</h2>
                {websiteUrls.length === 0 ? (
                  <p>No websites found. Add articles to your Gist to see them here!</p>
                ) : (
                  <ul>
                    {websiteUrls.map((site, index) => (
                      <li key={index}>
                        <a href={site.url} target="_blank" rel="noopener noreferrer">
                          {site.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
            {activeTab === "articles" && <TabbedContent articles={articles} />}
          </>
        )}
      </main>
    </div>
  );
}

export default App;
