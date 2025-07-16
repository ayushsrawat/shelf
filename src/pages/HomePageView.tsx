import type { Article } from "../interfaces/Article";
import TabbedContent from "../components/TabbedContent";
import "./HomePageView.css";

function HomePageView({
  articles,
  loading,
  error,
  websiteUrls,
  activeTab,
  setActiveTab,
}: {
  articles: Article[];
  loading: boolean;
  error: string | null;
  websiteUrls: { name: string; url: string }[];
  activeTab: "websites" | "articles";
  setActiveTab: React.Dispatch<React.SetStateAction<"websites" | "articles">>;
}) {
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

      <main className="app-main">
        {loading && <p className="loading-message">Loading articles from your Shelf...</p>}
        {error && <p className="error-message">{error}</p>}

        {!loading && !error && (
          <>
            {activeTab === "websites" && (
              <div className="websites-list">
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
    </>
  );
}

export default HomePageView;
