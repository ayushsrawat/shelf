package github

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/ayushsrawat/shelf/config"
	"github.com/ayushsrawat/shelf/models"
)

type GistUpdatePayload struct {
	Description string               `json:"description,omitempty"`
	Files       map[string]*GistFile `json:"files"`
}

type GistFile struct {
	Content string `json:"content"`
}

func UpdateArticlesInGist(cfg config.Config, articles []models.Article) error {
	jsonData, err := json.MarshalIndent(articles, "", "  ")
	if err != nil {
		return err
	}

	payload := GistUpdatePayload{
		Description: "Auto-update articles from Shelf Admin",
		Files: map[string]*GistFile{
			"articles.json": {
				Content: string(jsonData),
			},
		},
	}

	reqBodyBytes, err := json.Marshal(payload)
	if err != nil {
		return err
	}

	gistId := cfg.GistID

	if gistId == "" {
		return fmt.Errorf("gist ID is not configured")
	}

	url := fmt.Sprintf("https://api.github.com/gists/%s", gistId)
	req, err := http.NewRequest(http.MethodPatch, url, bytes.NewBuffer(reqBodyBytes))
	if err != nil {
		return err
	}

	token := cfg.GitHubPAT

	if token == "" {
		return fmt.Errorf("gitHub PAT is not configured")
	}

	req.Header.Set("Accept", "application/vnd.github+json")
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", token))
	req.Header.Set("X-GitHub-Api-Version", "2022-11-28")
	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("failed to update gist: status %d, body: %s", resp.StatusCode, string(bodyBytes))
	}

	return nil
}
