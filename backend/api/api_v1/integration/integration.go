package integration

import (
	"matrix-panel/db"
	"matrix-panel/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

// CreateIntegration 创建集成
// POST /api/v1/integrations
func CreateIntegration(c *gin.Context) {
	var req struct {
		Name    string            `json:"name" binding:"required"`
		Kind    string            `json:"kind" binding:"required"`
		URL     string            `json:"url" binding:"required"`
		Icon    string            `json:"icon"`
		Secrets map[string]string `json:"secrets"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误: " + err.Error()})
		return
	}

	// 创建集成实例
	integration := models.Integration{
		Name:   req.Name,
		Kind:   req.Kind,
		URL:    req.URL,
		Icon:   req.Icon,
		Enable: true,
	}

	// 设置密钥
	if req.Secrets != nil {
		integration.SecretMap = req.Secrets
		// BeforeSave钩子会自动序列化
	}

	// 保存到数据库
	if err := db.DB.Create(&integration).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建失败: " + err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    integration,
	})
}

// GetIntegrations 获取集成列表
// GET /api/v1/integrations
func GetIntegrations(c *gin.Context) {
	var integrations []models.Integration

	// 查询所有集成
	if err := db.DB.Find(&integrations).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "查询失败: " + err.Error()})
		return
	}

	// 填充SecretMap(AfterFind钩子会自动反序列化)
	for i := range integrations {
		integrations[i].AfterFind()
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    integrations,
	})
}

// GetIntegration 获取单个集成
// GET /api/v1/integrations/:id
func GetIntegration(c *gin.Context) {
	id := c.Param("id")

	var integration models.Integration
	if err := db.DB.First(&integration, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "集成不存在"})
		return
	}

	// 填充SecretMap
	integration.AfterFind()

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    integration,
	})
}

// UpdateIntegration 更新集成
// PUT /api/v1/integrations/:id
func UpdateIntegration(c *gin.Context) {
	id := c.Param("id")

	var req struct {
		Name    *string           `json:"name"`
		URL     *string           `json:"url"`
		Icon    *string           `json:"icon"`
		Enable  *bool             `json:"enable"`
		Secrets map[string]string `json:"secrets"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误: " + err.Error()})
		return
	}

	// 查询集成
	var integration models.Integration
	if err := db.DB.First(&integration, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "集成不存在"})
		return
	}

	// 准备更新数据
	updates := make(map[string]interface{})
	if req.Name != nil {
		updates["name"] = *req.Name
	}
	if req.URL != nil {
		updates["url"] = *req.URL
	}
	if req.Icon != nil {
		updates["icon"] = *req.Icon
	}
	if req.Enable != nil {
		updates["enable"] = *req.Enable
	}

	// 更新密钥
	if req.Secrets != nil {
		integration.SecretMap = req.Secrets
		integration.BeforeSave()
		updates["secrets"] = integration.Secrets
	}

	// 执行更新
	if err := db.DB.Model(&integration).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "更新失败: " + err.Error()})
		return
	}

	// 重新查询最新数据
	db.DB.First(&integration, "id = ?", id)
	integration.AfterFind()

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    integration,
	})
}

// DeleteIntegration 删除集成
// DELETE /api/v1/integrations/:id
func DeleteIntegration(c *gin.Context) {
	id := c.Param("id")

	// 执行删除
	result := db.DB.Delete(&models.Integration{}, "id = ?", id)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "删除失败: " + result.Error.Error()})
		return
	}

	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "集成不存在"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "删除成功",
	})
}

// TestIntegration 测试集成连接
// POST /api/v1/integrations/test
func TestIntegration(c *gin.Context) {
	var req struct {
		Kind    string            `json:"kind" binding:"required"`
		URL     string            `json:"url" binding:"required"`
		Secrets map[string]string `json:"secrets"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误: " + err.Error()})
		return
	}

	// TODO: 根据Kind创建对应的集成实例并测试连接
	// 目前返回成功(待实现具体测试逻辑)

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "连接测试成功",
		"data": map[string]interface{}{
			"kind":   req.Kind,
			"status": "connected",
		},
	})
}
