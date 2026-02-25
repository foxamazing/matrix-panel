package github

import (
	"context"
	"crypto"
	"crypto/rand"
	"crypto/rsa"
	"crypto/sha256"
	"crypto/x509"
	"encoding/base64"
	"encoding/json"
	"encoding/pem"
	"fmt"
	"matrix-panel/lib/integration"
	"net/http"
	"strconv"
	"strings"
	"time"
)

type GitHubIntegration struct {
	*integration.BaseIntegration
}

func New(id, name, baseURL string, secrets map[string]string) *GitHubIntegration {
	url := baseURL
	if url == "" {
		url = "https://api.github.com"
	}
	return &GitHubIntegration{
		BaseIntegration: integration.NewBaseIntegration(id, name, string(integration.KindGitHub), url, secrets),
	}
}

func (g *GitHubIntegration) TestConnection(ctx context.Context) error {
	token := g.getPersonalAccessToken()
	if token != "" {
		return g.testWithToken(ctx, token)
	}

	appJWT, installationID, ok, err := g.getAppJWT()
	if err != nil {
		return err
	}
	if ok {
		return g.testWithApp(ctx, appJWT, installationID)
	}

	return g.testWithoutAuth(ctx)
}

func (g *GitHubIntegration) getPersonalAccessToken() string {
	for _, key := range []string{"personalAccessToken", "token", "apiKey", "githubToken"} {
		if v := strings.TrimSpace(g.GetSecret(key)); v != "" {
			return v
		}
	}
	return ""
}

func (g *GitHubIntegration) testWithToken(ctx context.Context, token string) error {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, g.BuildURL("/user"), nil)
	if err != nil {
		return err
	}

	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Accept", "application/vnd.github+json")

	resp, err := g.Client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("github 连接失败: http %d", resp.StatusCode)
	}

	return nil
}

func (g *GitHubIntegration) testWithoutAuth(ctx context.Context) error {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, g.BuildURL("/octocat"), nil)
	if err != nil {
		return err
	}

	req.Header.Set("Accept", "application/vnd.github+json")

	resp, err := g.Client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("github 连接失败: http %d", resp.StatusCode)
	}

	return nil
}

func (g *GitHubIntegration) getAppJWT() (string, string, bool, error) {
	appID := strings.TrimSpace(g.GetSecret("githubAppId"))
	installationID := strings.TrimSpace(g.GetSecret("githubInstallationId"))
	privateKey := strings.TrimSpace(g.GetSecret("privateKey"))

	if appID == "" || installationID == "" || privateKey == "" {
		return "", "", false, nil
	}

	key, err := parseRSAPrivateKey([]byte(privateKey))
	if err != nil {
		return "", "", false, fmt.Errorf("github app 私钥解析失败: %w", err)
	}

	now := time.Now().UTC()
	payload := map[string]interface{}{
		"iat": now.Add(-time.Minute).Unix(),
		"exp": now.Add(9 * time.Minute).Unix(),
		"iss": appID,
	}

	token, err := buildJWT(key, payload)
	if err != nil {
		return "", "", false, fmt.Errorf("github app jwt 生成失败: %w", err)
	}

	if _, err := strconv.ParseInt(installationID, 10, 64); err != nil {
		return "", "", false, fmt.Errorf("github installationId 无效: %s", installationID)
	}

	return token, installationID, true, nil
}

func (g *GitHubIntegration) testWithApp(ctx context.Context, jwtToken, installationID string) error {
	path := "/app/installations/" + installationID
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, g.BuildURL(path), nil)
	if err != nil {
		return err
	}

	req.Header.Set("Authorization", "Bearer "+jwtToken)
	req.Header.Set("Accept", "application/vnd.github+json")

	resp, err := g.Client.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("github app 连接失败: http %d", resp.StatusCode)
	}

	return nil
}

func parseRSAPrivateKey(pemBytes []byte) (*rsa.PrivateKey, error) {
	block, _ := pem.Decode(pemBytes)
	if block == nil {
		return nil, fmt.Errorf("pem decode 失败")
	}

	key, err := x509.ParsePKCS1PrivateKey(block.Bytes)
	if err == nil {
		return key, nil
	}

	pkcs8Key, err2 := x509.ParsePKCS8PrivateKey(block.Bytes)
	if err2 != nil {
		return nil, err
	}

	rsaKey, ok := pkcs8Key.(*rsa.PrivateKey)
	if !ok {
		return nil, fmt.Errorf("私钥不是 RSA 类型")
	}

	return rsaKey, nil
}

func buildJWT(key *rsa.PrivateKey, payload map[string]interface{}) (string, error) {
	header := map[string]string{
		"alg": "RS256",
		"typ": "JWT",
	}

	headerJSON, err := json.Marshal(header)
	if err != nil {
		return "", err
	}

	payloadJSON, err := json.Marshal(payload)
	if err != nil {
		return "", err
	}

	enc := base64.RawURLEncoding
	headerEncoded := enc.EncodeToString(headerJSON)
	payloadEncoded := enc.EncodeToString(payloadJSON)
	signingInput := headerEncoded + "." + payloadEncoded

	hasher := sha256.New()
	hasher.Write([]byte(signingInput))
	hashed := hasher.Sum(nil)

	signature, err := rsa.SignPKCS1v15(rand.Reader, key, crypto.SHA256, hashed)
	if err != nil {
		return "", err
	}

	signatureEncoded := enc.EncodeToString(signature)

	return signingInput + "." + signatureEncoded, nil
}
