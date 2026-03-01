package widget

import (
	"context"
	"matrix-panel/api/api_v1/common/apiReturn"
	"sort"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/mmcdole/gofeed"
)

type RSSApi struct{}

type RSSItem struct {
	Title       string     `json:"title"`
	Link        string     `json:"link"`
	Description string     `json:"description"`
	Published   *time.Time `json:"published"`
	Author      string     `json:"author"`
	FeedTitle   string     `json:"feedTitle"`
}

// GetFeeds 获取并聚合 RSS Feeds
func (a RSSApi) GetFeeds(c *gin.Context) {
	var req struct {
		URLs               []string `json:"urls" binding:"required"`
		MaximumAmountPosts int      `json:"maximumAmountPosts" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		apiReturn.ErrorParamFomat(c, err.Error())
		return
	}

	parser := gofeed.NewParser()
	var allItems []RSSItem
	var mu sync.Mutex
	var wg sync.WaitGroup

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	for _, url := range req.URLs {
		wg.Add(1)
		go func(targetURL string) {
			defer wg.Done()
			feed, err := parser.ParseURLWithContext(targetURL, ctx)
			if err != nil {
				return // 忽略单个失败的源
			}

			mu.Lock()
			defer mu.Unlock()
			for _, item := range feed.Items {
				pubDate := item.PublishedParsed
				if pubDate == nil {
					pubDate = item.UpdatedParsed
				}

				allItems = append(allItems, RSSItem{
					Title:       item.Title,
					Link:        item.Link,
					Description: item.Description,
					Published:   pubDate,
					Author:      "", // 可选：从 item.Author 提取
					FeedTitle:   feed.Title,
				})
			}
		}(url)
	}

	wg.Wait()

	// 排序：按发布时间降序
	sort.Slice(allItems, func(i, j int) bool {
		if allItems[i].Published == nil {
			return false
		}
		if allItems[j].Published == nil {
			return true
		}
		return allItems[i].Published.After(*allItems[j].Published)
	})

	// 截断
	if len(allItems) > req.MaximumAmountPosts {
		allItems = allItems[:req.MaximumAmountPosts]
	}

	apiReturn.SuccessData(c, allItems)
}
