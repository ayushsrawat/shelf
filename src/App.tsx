import { useState, useEffect } from "react";
import { Routes, Route, useLocation, Link } from "react-router-dom";
import { getArticles } from "./utils/dataFetcher";
import type { Article } from "./interfaces/Article";
import HomePageView from "./pages/HomePageView";
import AddArticlePage from "./pages/AddArticlePage";
import "./App.css";

function App() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [activeTab, setActiveTab] = useState<"websites" | "articles">("articles");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();

  const fetchArticles = async () => {
    setLoading(true);
    setError(null);
    try {
      const fetchedArticles = await getArticles();
      setArticles(fetchedArticles);
    } catch (err) {
      console.error("Failed to load articles:", err);
      setError("Failed to load articles. Please check your network or Gist URL.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (location.pathname === "/") {
      fetchArticles();
    }
  }, [location.pathname]);

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
        <h1>
          {location.pathname === "/admin" ? (
            <Link to="/" className="app-title-link">
              Shelf
            </Link>
          ) : (
            "Shelf"
          )}
        </h1>
      </header>

      <Routes>
        <Route
          path="/"
          element={
            <HomePageView
              articles={articles}
              loading={loading}
              error={error}
              websiteUrls={websiteUrls}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          }
        />
        <Route
          path="/admin"
          element={
            <main className="app-main">
              <div className="tab-content-wrapper admin-wrapper">
                <AddArticlePage />
              </div>
            </main>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
