package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	MongoURI     string
	GitHubToken  string
	GitHubRepo   string
	GitHubOwner  string
	GitHubPath   string
	GitHubBranch string
	AdminSecret  string
	Port         string
}

func LoadConfig() Config {
	err := godotenv.Load()
	if err != nil {
		log.Println("No .env file found, relying on environment variables")
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	branch := os.Getenv("GITHUB_BRANCH")
	if branch == "" {
		branch = "main" // default to main if not provided
	}

	return Config{
		MongoURI:     os.Getenv("MONGO_URI"),
		GitHubToken:  os.Getenv("GITHUB_TOKEN"),
		GitHubRepo:   os.Getenv("GITHUB_REPO"),
		GitHubOwner:  os.Getenv("GITHUB_OWNER"),
		GitHubPath:   os.Getenv("GITHUB_PATH"),
		GitHubBranch: branch,
		AdminSecret:  os.Getenv("ADMIN_SECRET"),
		Port:         port,
	}
}
