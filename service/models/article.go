package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Article struct {
	ID       primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Title    string             `bson:"title" json:"title"`
	URL      string             `bson:"url" json:"url"`
	Author   string             `bson:"author" json:"author"`
	Category string             `bson:"category" json:"category"`
	Read     bool               `bson:"read" json:"read"`
}
