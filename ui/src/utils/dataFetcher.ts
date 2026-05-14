import type { Article } from '../interfaces/Article';

const ARTICLES_JSON_URL = 'https://raw.githubusercontent.com/ayushsrawat/articles/refs/heads/main/articles.json';
// const GIST_URL = 'https://gist.githubusercontent.com/ayushsrawat/2892ac3ae430b11eb4a0336ceff15e5a/raw/articles.json';

export const getArticles = async (): Promise<Article[]> => {
  try {
    const response = await fetch(ARTICLES_JSON_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const articles: Article[] = await response.json();
    // console.log(`Fetched ${articles.length} articles from Gist.`);
    return articles;
  } catch (error) {
    console.error("Failed to fetch articles from Gist:", error);
    return [];
  }
};