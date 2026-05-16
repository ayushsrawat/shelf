package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	MongoURI     string
	GitHubPAT    string
	GistID       string
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

	return Config{
		MongoURI:     os.Getenv("MONGO_URI"),
		GitHubPAT:    os.Getenv("GITHUB_PAT"),
		GistID:       os.Getenv("GIST_ID"),
		AdminSecret:  os.Getenv("ADMIN_SECRET"),
		Port:         port,
	}
}
