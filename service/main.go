package main

import (
	"context"
	"fmt"
	"net/http"

	"github.com/ayushsrawat/shelf/config"
	"github.com/ayushsrawat/shelf/db"
	"github.com/ayushsrawat/shelf/github"
	"github.com/ayushsrawat/shelf/models"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

func AuthMiddleware(secret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		token := c.GetHeader("Authorization")
		if token != "Bearer "+secret {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
			return
		}
		c.Next()
	}
}

func main() {
	cfg := config.LoadConfig()

	database, err := db.ConnectDB(cfg)
	if err != nil {
		fmt.Printf("Failed to connect to DB: %v\n", err)
		return
	}
	defer database.Disconnect()

	router := gin.Default()

	// CORS config
	corsConfig := cors.DefaultConfig()
	corsConfig.AllowAllOrigins = true
	corsConfig.AllowHeaders = []string{"Origin", "Content-Length", "Content-Type", "Authorization"}
	router.Use(cors.New(corsConfig))

	router.GET("/ping", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{"message": "pong"})
	})

	api := router.Group("/api")
	api.Use(AuthMiddleware(cfg.AdminSecret))
	{
		api.POST("/login", func(c *gin.Context) {
			// If it passes AuthMiddleware, it's successful
			c.JSON(http.StatusOK, gin.H{"message": "Logged in"})
		})

		api.GET("/articles", func(c *gin.Context) {
			searchQuery := c.Query("q")
			articles, err := database.GetAllArticles(c.Request.Context(), searchQuery)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			c.JSON(http.StatusOK, articles)
		})

		api.POST("/articles", func(c *gin.Context) {
			var article models.Article
			if err := c.ShouldBindJSON(&article); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}

			createdArticle, err := database.CreateArticle(c.Request.Context(), article)
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}

			syncToGitHub(cfg, database)

			c.JSON(http.StatusCreated, createdArticle)
		})

		api.PUT("/articles/:id", func(c *gin.Context) {
			idParam := c.Param("id")
			id, err := primitive.ObjectIDFromHex(idParam)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
				return
			}

			var article models.Article
			if err := c.ShouldBindJSON(&article); err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}

			if err := database.UpdateArticle(c.Request.Context(), id, article); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}

			syncToGitHub(cfg, database)

			c.JSON(http.StatusOK, gin.H{"message": "Updated successfully"})
		})

		api.DELETE("/articles/:id", func(c *gin.Context) {
			idParam := c.Param("id")
			id, err := primitive.ObjectIDFromHex(idParam)
			if err != nil {
				c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid ID format"})
				return
			}

			if err := database.DeleteArticle(c.Request.Context(), id); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}

			syncToGitHub(cfg, database)

			c.JSON(http.StatusOK, gin.H{"message": "Deleted successfully"})
		})
	}

	if err := router.Run(":" + cfg.Port); err != nil {
		fmt.Printf("Error Running Server: %v", err)
	}
}

func syncToGitHub(cfg config.Config, database *db.DB) {
	go func() {
		articles, err := database.GetAllArticles(context.Background(), "")
		if err != nil {
			fmt.Printf("Failed to get articles for sync: %v\n", err)
			return
		}

		if err := github.UpdateArticlesInGist(cfg, articles); err != nil {
			fmt.Printf("Failed to sync to Gist: %v\n", err)
		} else {
			fmt.Println("Successfully synced articles to Gist!")
		}
	}()
}
