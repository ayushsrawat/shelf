import React, { useState } from "react";
import "./AddArticlePage.css";

function AddArticlePage() {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [website, setWebsite] = useState("");
  const [message, setMessage] = useState(""); // To show success/error messages
  const [isSubmitting, setIsSubmitting] = useState(false); // To disable button during submission

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission behavior (page reload)
    setMessage(""); // Clear previous messages
    setIsSubmitting(true); // Disable button

    // Basic client-side validation
    if (!title || !url || !website) {
      setMessage("Please fill in all fields.");
      setIsSubmitting(false);
      return;
    }

    const functionUrl = "http://localhost:8888/.netlify/functions/update-gist";

    const ADMIN_FRONTEND_KEY = "MySuperSecretShelfKey123";

    try {
      const response = await fetch(functionUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Key": ADMIN_FRONTEND_KEY, // Custom header for your secret
        },
        body: JSON.stringify({ title, url, website }),
      });

      const data = await response.json(); // Parse the JSON response from the function

      if (response.ok) {
        // Check if the response status is 2xx
        setMessage("Article added successfully! Gist updated.");
        // Clear form fields on success
        setTitle("");
        setUrl("");
        setWebsite("");
      } else {
        // Handle errors from the function
        setMessage(`Error: ${data.message || "Something went wrong."}`);
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setMessage("Network error or server issue. Check console for details.");
    } finally {
      setIsSubmitting(false); // Re-enable button
    }
  };

  return (
    <div className="add-article-container">
      <h2>Add New Article</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            aria-label="Article Title"
          />
        </div>
        <div className="form-group">
          <label htmlFor="url">URL:</label>
          <input
            type="url" // Use type="url" for basic browser-side URL validation
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            aria-label="Article URL"
          />
        </div>
        <div className="form-group">
          <label htmlFor="website">Website/Source:</label>
          <input
            type="text"
            id="website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            required
            aria-label="Website Name"
          />
        </div>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Adding..." : "Add Article"}
        </button>
        {message && <p className={`form-message ${message.startsWith("Error:") ? "error" : "success"}`}>{message}</p>}
      </form>
    </div>
  );
}

export default AddArticlePage;
