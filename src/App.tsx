import { useState, useEffect } from "react";
import { Routes, Route, useLocation, Link } from "react-router-dom";
import { getArticles } from "./utils/dataFetcher";
import type { Article } from "./interfaces/Article";
import HomePageView from "./pages/HomePageView";
import AddArticlePage from "./pages/AddArticlePage";
import ThemeToggle from "./components/ThemeToggle";
import "./App.css";

function App() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [activeTab, setActiveTab] = useState<"authors" | "articles">("articles");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState("dark");
  const location = useLocation();

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    document.documentElement.classList.remove(theme);
    document.documentElement.classList.add(newTheme);
    setTheme(newTheme);
  };

  useEffect(() => {
    document.documentElement.classList.add(theme);
  }, []);

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

  return (
    <div className={`app-container`}>
      <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
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
