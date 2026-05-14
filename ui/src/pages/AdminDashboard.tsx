import React, { useState, useEffect } from "react";
import type { Article } from "../interfaces/Article";
import "./AdminDashboard.css";
import "../pages/HomePageView.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

function AdminDashboard() {
  const [secret, setSecret] = useState(localStorage.getItem("adminSecret") || "");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("Uncategorized");
  const [read, setRead] = useState(false);

  useEffect(() => {
    if (secret) {
      handleLogin(new Event("submit") as any, secret);
    }
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  useEffect(() => {
    if (isAuthenticated && secret) {
      fetchArticles(secret, debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);

  const handleLogin = async (e: React.FormEvent, token = secret) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch(`${API_BASE_URL}/login`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (response.ok) {
        setIsAuthenticated(true);
        localStorage.setItem("adminSecret", token);
        setSecret(token);
        fetchArticles(token);
      } else {
        setMessage("Invalid Secret Key");
        localStorage.removeItem("adminSecret");
        setIsAuthenticated(false);
      }
    } catch (err) {
      setMessage("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminSecret");
    setIsAuthenticated(false);
    setSecret("");
    setArticles([]);
  };

  const fetchArticles = async (token: string, query = "") => {
    setLoading(true);
    try {
      const url = query ? `${API_BASE_URL}/articles?q=${encodeURIComponent(query)}` : `${API_BASE_URL}/articles`;
      const response = await fetch(url, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setArticles(data || []);
      }
    } catch (err) {
      console.error("Failed to fetch articles:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const newArticle = { title, url, author, category, read };
    const method = editingId ? "PUT" : "POST";
    const endpoint = editingId ? `${API_BASE_URL}/articles/${editingId}` : `${API_BASE_URL}/articles`;

    try {
      const response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${secret}`
        },
        body: JSON.stringify(newArticle),
      });

      if (response.ok) {
        setMessage(editingId ? "Article updated!" : "Article added!");
        resetForm();
        setIsModalOpen(false);
        fetchArticles(secret);
      } else {
        const errorData = await response.json();
        setMessage(`Error: ${errorData.error || "Failed to save"}`);
      }
    } catch (err) {
      setMessage("Network error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this article?")) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/articles/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${secret}` }
      });
      if (response.ok) {
        fetchArticles(secret);
      } else {
        alert("Failed to delete article");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const editArticle = (article: any) => {
    setEditingId(article.id);
    setTitle(article.title);
    setUrl(article.url);
    setAuthor(article.author);
    setCategory(article.category || "Uncategorized");
    setRead(article.read || false);
    setIsModalOpen(true);
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setUrl("");
    setAuthor("");
    setCategory("Uncategorized");
    setRead(false);
    setMessage("");
  };

  const openNewArticleModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  if (!isAuthenticated) {
    return (
      <div className="login-wrapper">
        <div className="login-card">
          <h2>Admin Login</h2>
          <form onSubmit={(e) => handleLogin(e)} className="login-form">
            <input 
              type="password" 
              placeholder="Enter Admin Secret" 
              value={secret} 
              onChange={(e) => setSecret(e.target.value)} 
              className="search-input"
              required 
            />
            <button type="submit" className="login-btn" disabled={loading}>
              {loading ? "Authenticating..." : "Enter Vault"}
            </button>
          </form>
          {message && <p className="error-message">{message}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-container">
      <div className="admin-header-actions">
        <h2>Dashboard Overview ({articles.length})</h2>
        <div className="action-buttons">
          <button className="add-new-btn" onClick={openNewArticleModal}>+ Add New Article</button>
          <button onClick={handleLogout} className="logout-btn">Logout</button>
        </div>
      </div>

      <div className="filters-container admin-filters">
        <div className="search-bar-container">
          <input
            type="text"
            placeholder="Search articles by title, author, or category..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <main className="app-main">
        {loading && articles.length === 0 && <p className="loading-message">Loading from your database...</p>}
        <div className="content-list">
          {articles.map((article) => {
             const categories = article.category ? article.category.split(",").map((c) => c.trim()) : [];
             return (
              <div key={article.id} className="article-card-wrapper">
                <div className="article-card-inner">
                  {article.read && <div className="read-indicator" title="Read"></div>}
                  <div className="article-card-content">
                    <h3>{article.title}</h3>
                    <a href={article.url} target="_blank" rel="noopener noreferrer" className="article-url-preview">
                      {article.url}
                    </a>
                  </div>
                  <div className="article-card-footer">
                    {article.author && <p className="author-name">{article.author}</p>}
                    {categories.slice(0, 2).map((cat, idx) => (
                      <span key={idx} className="category-badge">{cat}</span>
                    ))}
                    {categories.length > 2 && <span className="category-badge">+{categories.length - 2}</span>}
                  </div>
                </div>
                <div className="admin-card-actions">
                  <button onClick={() => editArticle(article)} className="edit-btn">Edit</button>
                  <button onClick={() => handleDelete(article.id!)} className="delete-btn">Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingId ? "Edit Article" : "Add New Article"}</h3>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSubmitArticle} className="modal-form">
              <div className="form-group">
                <label>Title</label>
                <input type="text" className="search-input" value={title} onChange={e => setTitle(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>URL</label>
                <input type="url" className="search-input" value={url} onChange={e => setUrl(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Author</label>
                <input type="text" className="search-input" value={author} onChange={e => setAuthor(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Category (comma separated)</label>
                <input type="text" className="search-input" value={category} onChange={e => setCategory(e.target.value)} />
              </div>
              <div className="form-group checkbox-group">
                <label>
                  <input type="checkbox" checked={read} onChange={e => setRead(e.target.checked)} />
                  Mark as Read
                </label>
              </div>
              <div className="modal-actions">
                <button type="submit" className="save-btn" disabled={loading}>
                  {loading ? "Saving..." : (editingId ? "Update Article" : "Save Article")}
                </button>
                <button type="button" className="cancel-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
              </div>
              {message && <p className="modal-message">{message}</p>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
