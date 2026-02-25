package widget

import (
	"matrix-panel/db"
	"matrix-panel/models"
	"net/http"

	"github.com/gin-gonic/gin"
)

// GetBoardWidgets 获取看板的所有Widget
// GET /api/v1/boards/:boardId/widgets
func GetBoardWidgets(c *gin.Context) {
	boardID := c.Param("boardId")

	// 查询Widget列表
	var widgets []models.WidgetInstance
	if err := db.DB.Where("board_id = ?", boardID).Find(&widgets).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "查询失败: " + err.Error()})
		return
	}

	// 填充运行时字段
	for i := range widgets {
		widgets[i].GetOptions()
		widgets[i].GetIntegrationIDs()
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    widgets,
	})
}

// CreateWidget 创建Widget
// POST /api/v1/widgets
func CreateWidget(c *gin.Context) {
	var req struct {
		BoardID        string                 `json:"boardId" binding:"required"`
		Kind           string                 `json:"kind" binding:"required"`
		X              int                    `json:"x"`
		Y              int                    `json:"y"`
		Width          int                    `json:"width"`
		Height         int                    `json:"height"`
		Options        map[string]interface{} `json:"options"`
		IntegrationIDs []string               `json:"integrationIds"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误: " + err.Error()})
		return
	}

	// 验证看板是否存在
	var board models.Board
	if err := db.DB.First(&board, "id = ?", req.BoardID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "看板不存在"})
		return
	}

	// 创建Widget实例
	widget := models.WidgetInstance{
		BoardID: req.BoardID,
		Kind:    req.Kind,
		X:       req.X,
		Y:       req.Y,
		Width:   req.Width,
		Height:  req.Height,
	}

	// 设置选项和集成ID
	if req.Options != nil {
		widget.SetOptions(req.Options)
	}
	if req.IntegrationIDs != nil {
		widget.SetIntegrationIDs(req.IntegrationIDs)
	}

	// 保存到数据库
	if err := db.DB.Create(&widget).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "创建失败: " + err.Error()})
		return
	}

	// 填充运行时字段
	widget.GetOptions()
	widget.GetIntegrationIDs()

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    widget,
	})
}

// UpdateWidget 更新Widget
// PUT /api/v1/widgets/:id
func UpdateWidget(c *gin.Context) {
	widgetID := c.Param("id")

	var req struct {
		X              *int                   `json:"x"`
		Y              *int                   `json:"y"`
		Width          *int                   `json:"width"`
		Height         *int                   `json:"height"`
		Options        map[string]interface{} `json:"options"`
		IntegrationIDs []string               `json:"integrationIds"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "参数错误: " + err.Error()})
		return
	}

	// 查询Widget
	var widget models.WidgetInstance
	if err := db.DB.First(&widget, "id = ?", widgetID).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Widget不存在"})
		return
	}

	// 准备更新数据
	updates := make(map[string]interface{})

	if req.X != nil {
		updates["x"] = *req.X
	}
	if req.Y != nil {
		updates["y"] = *req.Y
	}
	if req.Width != nil {
		updates["width"] = *req.Width
	}
	if req.Height != nil {
		updates["height"] = *req.Height
	}

	// 更新选项
	if req.Options != nil {
		widget.SetOptions(req.Options)
		updates["options"] = widget.Options
	}

	// 更新集成ID
	if req.IntegrationIDs != nil {
		widget.SetIntegrationIDs(req.IntegrationIDs)
		updates["integration_ids"] = widget.IntegrationIDs
	}

	// 执行更新
	if err := db.DB.Model(&widget).Updates(updates).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "更新失败: " + err.Error()})
		return
	}

	// 重新查询最新数据
	db.DB.First(&widget, "id = ?", widgetID)
	widget.GetOptions()
	widget.GetIntegrationIDs()

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    widget,
	})
}

// DeleteWidget 删除Widget
// DELETE /api/v1/widgets/:id
func DeleteWidget(c *gin.Context) {
	widgetID := c.Param("id")

	// 执行删除
	result := db.DB.Delete(&models.WidgetInstance{}, "id = ?", widgetID)
	if result.Error != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "删除失败: " + result.Error.Error()})
		return
	}

	if result.RowsAffected == 0 {
		c.JSON(http.StatusNotFound, gin.H{"error": "Widget不存在"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"message": "删除成功",
	})
}

// GetDefaultBoard 获取默认看板ID
// GET /api/v1/boards/default
func GetDefaultBoard(c *gin.Context) {
	var board models.Board
	if err := db.DB.First(&board).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "未找到看板"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    board,
	})
}
