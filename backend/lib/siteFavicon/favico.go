package siteFavicon

import (
	"context"
	"errors"
	"fmt"
	"io"
	"matrix-panel/lib/cmn"
	"net"
	"net/http"
	"net/url"
	"os"
	"path"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/PuerkitoBio/goquery"
)

func IsHTTPURL(url string) bool {
	httpPattern := `^(http://|https://|//)`
	match, err := regexp.MatchString(httpPattern, url)
	if err != nil {
		return false
	}
	return match
}

func NormalizeAndValidatePublicHTTPURL(raw string) (string, error) {
	normalized, err := normalizeHTTPURL(raw)
	if err != nil {
		return "", err
	}
	u, err := url.Parse(normalized)
	if err != nil {
		return "", err
	}
	if err := validateOutboundURL(u); err != nil {
		return "", err
	}
	return u.String(), nil
}

func normalizeHTTPURL(raw string) (string, error) {
	target := strings.TrimSpace(raw)
	if target == "" {
		return "", errors.New("url required")
	}
	if strings.HasPrefix(target, "//") {
		target = "https:" + target
	} else if !strings.HasPrefix(target, "http://") && !strings.HasPrefix(target, "https://") {
		target = "https://" + target
	}
	return target, nil
}

func validateOutboundURL(u *url.URL) error {
	if u == nil {
		return errors.New("invalid url")
	}
	if u.User != nil {
		return errors.New("userinfo not allowed")
	}
	if u.Scheme != "http" && u.Scheme != "https" {
		return errors.New("unsupported scheme")
	}
	host := strings.TrimSpace(u.Hostname())
	if host == "" {
		return errors.New("host required")
	}
	hostLower := strings.ToLower(host)
	if hostLower == "localhost" || strings.HasSuffix(hostLower, ".localhost") {
		return errors.New("localhost not allowed")
	}
	if ip := net.ParseIP(host); ip != nil {
		if isBlockedIP(ip) {
			return errors.New("private ip not allowed")
		}
		return nil
	}
	ips, err := net.LookupIP(host)
	if err != nil || len(ips) == 0 {
		return errors.New("dns lookup failed")
	}
	for _, ip := range ips {
		if isBlockedIP(ip) {
			return errors.New("private ip not allowed")
		}
	}
	return nil
}

func isBlockedIP(ip net.IP) bool {
	if ip == nil {
		return true
	}
	if ip.IsUnspecified() || ip.IsLoopback() || ip.IsMulticast() || ip.IsLinkLocalUnicast() || ip.IsLinkLocalMulticast() {
		return true
	}
	if ip.IsPrivate() {
		return true
	}
	return false
}

func newSecureHTTPClient() *http.Client {
	dialer := &net.Dialer{
		Timeout:   6 * time.Second,
		KeepAlive: 30 * time.Second,
	}
	transport := &http.Transport{
		Proxy: http.ProxyFromEnvironment,
		DialContext: func(ctx context.Context, network, addr string) (net.Conn, error) {
			host, _, err := net.SplitHostPort(addr)
			if err != nil {
				host = addr
			}
			host = strings.TrimSpace(host)
			if host == "" {
				return nil, errors.New("invalid host")
			}
			if ip := net.ParseIP(host); ip != nil {
				if isBlockedIP(ip) {
					return nil, errors.New("private ip not allowed")
				}
			} else {
				ips, err := net.DefaultResolver.LookupIPAddr(ctx, host)
				if err != nil || len(ips) == 0 {
					return nil, errors.New("dns lookup failed")
				}
				for _, ip := range ips {
					if isBlockedIP(ip.IP) {
						return nil, errors.New("private ip not allowed")
					}
				}
			}
			return dialer.DialContext(ctx, network, addr)
		},
		TLSHandshakeTimeout:   6 * time.Second,
		ResponseHeaderTimeout: 6 * time.Second,
		IdleConnTimeout:       30 * time.Second,
		MaxIdleConns:          10,
		MaxIdleConnsPerHost:   2,
		DisableCompression:    false,
		ForceAttemptHTTP2:     true,
	}
	return &http.Client{
		Timeout:   8 * time.Second,
		Transport: transport,
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			if len(via) >= 3 {
				return errors.New("too many redirects")
			}
			return validateOutboundURL(req.URL)
		},
	}
}

func GetOneFaviconURL(urlStr string) (string, error) {
	normalized, err := NormalizeAndValidatePublicHTTPURL(urlStr)
	if err != nil {
		return "", err
	}
	iconURLs, err := getFaviconURL(normalized)
	if err != nil {
		return "", err
	}

	for _, v := range iconURLs {
		// 标准的路径地址
		if IsHTTPURL(v) {
			return v, nil
		} else {
			urlInfo, _ := url.Parse(normalized)
			fullUrl := urlInfo.Scheme + "://" + urlInfo.Host + "/" + strings.TrimPrefix(v, "/")
			return fullUrl, nil
		}
	}
	return "", fmt.Errorf("not found ico")
}

// 获取远程文件的大小
func GetRemoteFileSize(url string) (int64, error) {
	normalized, err := NormalizeAndValidatePublicHTTPURL(url)
	if err != nil {
		return 0, err
	}
	client := newSecureHTTPClient()
	req, err := http.NewRequest("HEAD", normalized, nil)
	if err != nil {
		return 0, err
	}
	resp, err := client.Do(req)
	if err != nil {
		return 0, err
	}
	defer resp.Body.Close()

	// 检查HTTP响应状态
	if resp.StatusCode != http.StatusOK {
		return 0, fmt.Errorf("HTTP request failed, status code: %d", resp.StatusCode)
	}

	// 获取Content-Length字段，即文件大小
	size := resp.ContentLength
	return size, nil
}

// 下载图片
func DownloadImage(url, savePath string, maxSize int64) (*os.File, error) {
	// 获取远程文件大小
	normalized, err := NormalizeAndValidatePublicHTTPURL(url)
	if err != nil {
		return nil, err
	}
	fileSize, err := GetRemoteFileSize(normalized)
	if err != nil {
		return nil, err
	}

	// 判断文件大小是否在阈值内
	if fileSize > maxSize {
		return nil, fmt.Errorf("文件太大，不下载。大小：%d字节", fileSize)
	}

	// 发送HTTP GET请求获取图片数据
	client := newSecureHTTPClient()
	req, err := http.NewRequest("GET", normalized, nil)
	if err != nil {
		return nil, err
	}
	response, err := client.Do(req)
	if err != nil {
		return nil, err
	}
	defer response.Body.Close()

	// 检查HTTP响应状态
	if response.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("HTTP request failed, status code: %d", response.StatusCode)
	}
	if response.ContentLength > maxSize {
		return nil, fmt.Errorf("文件太大，不下载。大小：%d字节", response.ContentLength)
	}

	urlFileName := path.Base(normalized)
	fileExt := path.Ext(normalized)
	fileName := cmn.Md5(fmt.Sprintf("%s%s", urlFileName, time.Now().String())) + fileExt

	destination := savePath + "/" + fileName

	// 创建本地文件用于保存图片
	file, err := os.Create(destination)
	if err != nil {
		return nil, err
	}

	// 将图片数据写入本地文件
	n, err := io.Copy(file, io.LimitReader(response.Body, maxSize+1))
	if err == nil && n > maxSize {
		err = fmt.Errorf("文件太大，不下载。大小：%d字节", n)
	}
	if closeErr := file.Close(); err == nil && closeErr != nil {
		err = closeErr
	}
	if err != nil {
		_ = os.Remove(destination)
		return nil, err
	}
	return file, nil
}

func GetOneFaviconURLAndUpload(urlStr string) (string, bool) {
	//www.iqiyipic.com/pcwimg/128-128-logo.png
	normalized, err := NormalizeAndValidatePublicHTTPURL(urlStr)
	if err != nil {
		return "", false
	}
	iconURLs, err := getFaviconURL(normalized)
	if err != nil {
		return "", false
	}

	for _, v := range iconURLs {
		// 标准的路径地址
		if IsHTTPURL(v) {
			return v, true
		} else {
			urlInfo, _ := url.Parse(normalized)
			fullUrl := urlInfo.Scheme + "://" + urlInfo.Host + "/" + strings.TrimPrefix(v, "/")
			return fullUrl, true
		}
	}
	return "", false
}

func getFaviconURL(url string) ([]string, error) {
	var icons []string
	icons = make([]string, 0)
	normalized, err := NormalizeAndValidatePublicHTTPURL(url)
	if err != nil {
		return icons, err
	}
	client := newSecureHTTPClient()
	req, err := http.NewRequest("GET", normalized, nil)
	if err != nil {
		return icons, err
	}

	// 设置User-Agent头字段，模拟浏览器请求
	req.Header.Set("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3")

	resp, err := client.Do(req)
	if err != nil {
		return icons, err
	}

	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return icons, errors.New("HTTP request failed with status code " + strconv.Itoa(resp.StatusCode))
	}

	doc, err := goquery.NewDocumentFromReader(io.LimitReader(resp.Body, 1024*1024))
	if err != nil {
		return icons, err
	}

	// 查找所有link标签，筛选包含rel属性为"icon"的标签
	doc.Find("link").Each(func(i int, s *goquery.Selection) {
		rel, _ := s.Attr("rel")
		href, _ := s.Attr("href")

		if strings.Contains(rel, "icon") && href != "" {
			// fmt.Println(href)
			icons = append(icons, href)
		}
	})

	if len(icons) == 0 {
		return icons, errors.New("favicon not found on the page")
	}

	return icons, nil
}
