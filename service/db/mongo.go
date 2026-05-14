package db

import (
	"context"
	"fmt"
	"time"

	"github.com/ayushsrawat/shelf/config"
	"github.com/ayushsrawat/shelf/models"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

// database : shelf, collection : articles
type DB struct {
	client     *mongo.Client
	collection *mongo.Collection
}

func ConnectDB(cfg config.Config) (*DB, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	client, err := mongo.Connect(ctx, options.Client().ApplyURI(cfg.MongoURI))
	if err != nil {
		return nil, err
	}

	err = client.Ping(ctx, nil)
	if err != nil {
		return nil, err
	}

	fmt.Println("Connected to MongoDB!")
	collection := client.Database("shelf").Collection("articles")

	return &DB{client: client, collection: collection}, nil
}

func (db *DB) Disconnect() {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	if err := db.client.Disconnect(ctx); err != nil {
		fmt.Printf("Error disconnecting from MongoDB: %v\n", err)
	}
}

func (db *DB) GetAllArticles(ctx context.Context) ([]models.Article, error) {
	var articles []models.Article
	cursor, err := db.collection.Find(ctx, bson.M{})
	if err != nil {
		return nil, err
	}
	defer cursor.Close(ctx)

	if err = cursor.All(ctx, &articles); err != nil {
		return nil, err
	}
	
	if articles == nil {
		articles = []models.Article{}
	}
	return articles, nil
}

func (db *DB) CreateArticle(ctx context.Context, article models.Article) (models.Article, error) {
	article.ID = primitive.NewObjectID()
	_, err := db.collection.InsertOne(ctx, article)
	if err != nil {
		return article, err
	}
	return article, nil
}

func (db *DB) UpdateArticle(ctx context.Context, id primitive.ObjectID, updatedArticle models.Article) error {
	filter := bson.M{"_id": id}
	update := bson.M{
		"$set": bson.M{
			"title":    updatedArticle.Title,
			"url":      updatedArticle.URL,
			"author":   updatedArticle.Author,
			"category": updatedArticle.Category,
			"read":     updatedArticle.Read,
		},
	}
	_, err := db.collection.UpdateOne(ctx, filter, update)
	return err
}

func (db *DB) DeleteArticle(ctx context.Context, id primitive.ObjectID) error {
	filter := bson.M{"_id": id}
	_, err := db.collection.DeleteOne(ctx, filter)
	return err
}
