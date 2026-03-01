package panel

import (
	"fmt"

	"matrix-panel/api/api_v1/common/apiReturn"
	"matrix-panel/api/api_v1/common/base"
	"matrix-panel/db"
	"matrix-panel/models"

	"github.com/gin-gonic/gin"
	"gorm.io/gorm"
)

type BoardApi struct{}

// GetBoardList returns all boards.
func (b *BoardApi) GetBoardList(c *gin.Context) {
	var boards []models.Board
	if err := db.DB.Find(&boards).Error; err != nil {
		apiReturn.ErrorDatabase(c, err.Error())
		return
	}
	apiReturn.SuccessData(c, boards)
}

// GetBoardDetail returns board detail with widgets.
func (b *BoardApi) GetBoardDetail(c *gin.Context) {
	id := c.Param("id")
	var board models.Board
	if err := db.DB.Preload("WidgetInstances").First(&board, "id = ?", id).Error; err != nil {
		apiReturn.ErrorDataNotFound(c)
		return
	}

	for i := range board.WidgetInstances {
		board.WidgetInstances[i].GetOptions()
		board.WidgetInstances[i].GetIntegrationIDs()
	}

	apiReturn.SuccessData(c, board)
}

// CreateBoard creates a new board.
func (b *BoardApi) CreateBoard(c *gin.Context) {
	var board models.Board
	if err := c.ShouldBindJSON(&board); err != nil {
		apiReturn.ErrorParamFomat(c, err.Error())
		return
	}

	currentUser, _ := base.GetCurrentUserInfo(c)
	board.CreatorID = fmt.Sprintf("%d", currentUser.ID)

	if err := db.DB.Create(&board).Error; err != nil {
		apiReturn.ErrorDatabase(c, err.Error())
		return
	}
	apiReturn.SuccessData(c, board)
}

// UpdateBoard updates board properties.
func (b *BoardApi) UpdateBoard(c *gin.Context) {
	id := c.Param("id")
	var reqBoard models.Board
	if err := c.ShouldBindJSON(&reqBoard); err != nil {
		apiReturn.ErrorParamFomat(c, err.Error())
		return
	}

	updateData := map[string]interface{}{
		"name":                        reqBoard.Name,
		"is_public":                   reqBoard.IsPublic,
		"layout_config":               reqBoard.LayoutConfig,
		"page_title":                  reqBoard.PageTitle,
		"meta_title":                  reqBoard.MetaTitle,
		"logo_image_url":              reqBoard.LogoImageUrl,
		"favicon_image_url":           reqBoard.FaviconImageUrl,
		"background_image_url":        reqBoard.BackgroundImageUrl,
		"background_image_attachment": reqBoard.BackgroundImageAttachment,
		"background_image_repeat":     reqBoard.BackgroundImageRepeat,
		"background_image_size":       reqBoard.BackgroundImageSize,
		"primary_color":               reqBoard.PrimaryColor,
		"secondary_color":             reqBoard.SecondaryColor,
		"opacity":                     reqBoard.Opacity,
		"icon_color":                  reqBoard.IconColor,
		"item_radius":                 reqBoard.ItemRadius,
		"custom_css":                  reqBoard.CustomCss,
		"disable_status":              reqBoard.DisableStatus,
	}

	if err := db.DB.Model(&models.Board{}).Where("id = ?", id).Updates(updateData).Error; err != nil {
		apiReturn.ErrorDatabase(c, err.Error())
		return
	}
	apiReturn.Success(c)
}

// DuplicateBoard clones a board and its widgets.
func (b *BoardApi) DuplicateBoard(c *gin.Context) {
	id := c.Param("id")
	var sourceBoard models.Board
	if err := db.DB.Preload("WidgetInstances").First(&sourceBoard, "id = ?", id).Error; err != nil {
		apiReturn.ErrorDataNotFound(c)
		return
	}

	newBoard := sourceBoard
	newBoard.ID = ""
	newBoard.Name = sourceBoard.Name + " (Copy)"

	currentUser, _ := base.GetCurrentUserInfo(c)
	newBoard.CreatorID = fmt.Sprintf("%d", currentUser.ID)

	err := db.DB.Transaction(func(tx *gorm.DB) error {
		if err := tx.Create(&newBoard).Error; err != nil {
			return err
		}
		for _, widget := range sourceBoard.WidgetInstances {
			newWidget := widget
			newWidget.ID = ""
			newWidget.BoardID = newBoard.ID
			if err := tx.Create(&newWidget).Error; err != nil {
				return err
			}
		}
		return nil
	})
	if err != nil {
		apiReturn.ErrorDatabase(c, err.Error())
		return
	}

	apiReturn.SuccessData(c, newBoard)
}

// DeleteBoard deletes a board.
func (b *BoardApi) DeleteBoard(c *gin.Context) {
	id := c.Param("id")
	if err := db.DB.Delete(&models.Board{}, "id = ?", id).Error; err != nil {
		apiReturn.ErrorDatabase(c, err.Error())
		return
	}
	apiReturn.Success(c)
}
