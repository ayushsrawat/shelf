package github

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/ayushsrawat/shelf/config"
	"github.com/ayushsrawat/shelf/models"
)

type FileInfo struct {
	SHA string `json:"sha"`
}

type UpdateFileRequest struct {
	Message string `json:"message"`
	Content string `json:"content"` // base64 encoded
	SHA     string `json:"sha,omitempty"`
	Branch  string `json:"branch"`
}

func UpdateArticlesInRepo(cfg config.Config, articles []models.Article) error {
	apiURL := fmt.Sprintf("https://api.github.com/repos/%s/%s/contents/%s", cfg.GitHubOwner, cfg.GitHubRepo, cfg.GitHubPath)
	getURL := apiURL
	if cfg.GitHubBranch != "" {
		getURL = fmt.Sprintf("%s?ref=%s", apiURL, cfg.GitHubBranch)
	}

	req, err := http.NewRequest(http.MethodGet, getURL, nil)
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "Bearer "+cfg.GitHubToken)
	req.Header.Set("Accept", "application/vnd.github.v3+json")

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	var sha string
	if resp.StatusCode == http.StatusOK {
		var fileInfo FileInfo
		if err := json.NewDecoder(resp.Body).Decode(&fileInfo); err != nil {
			return err
		}
		sha = fileInfo.SHA
	} else if resp.StatusCode != http.StatusNotFound {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return fmt.Errorf("failed to get file info: status %d, body: %s", resp.StatusCode, string(bodyBytes))
	}

	jsonData, err := json.MarshalIndent(articles, "", "  ")
	if err != nil {
		return err
	}
	encodedContent := base64.StdEncoding.EncodeToString(jsonData)

	updateReqBody := UpdateFileRequest{
		Message: "Auto-update articles from Shelf Admin",
		Content: encodedContent,
		SHA:     sha,
		Branch:  cfg.GitHubBranch,
	}

	reqBodyBytes, err := json.Marshal(updateReqBody)
	if err != nil {
		return err
	}

	putReq, err := http.NewRequest(http.MethodPut, apiURL, bytes.NewBuffer(reqBodyBytes))
	if err != nil {
		return err
	}
	putReq.Header.Set("Authorization", "Bearer "+cfg.GitHubToken)
	putReq.Header.Set("Accept", "application/vnd.github.v3+json")
	putReq.Header.Set("Content-Type", "application/json")

	putResp, err := client.Do(putReq)
	if err != nil {
		return err
	}
	defer putResp.Body.Close()

	if putResp.StatusCode != http.StatusOK && putResp.StatusCode != http.StatusCreated && putResp.StatusCode != http.StatusUnprocessableEntity {
		bodyBytes, _ := io.ReadAll(putResp.Body)
		return fmt.Errorf("failed to update file: status %d, body: %s", putResp.StatusCode, string(bodyBytes))
	}

	return nil
}
