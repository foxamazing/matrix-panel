package websocket

import (
	"log"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	// 允许所有来源（生产环境应该配置具体的来源）
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

// HandleWebSocket 处理 WebSocket 连接
func HandleWebSocket(hub *Hub) gin.HandlerFunc {
	return func(c *gin.Context) {
		// 升级 HTTP 连接为 WebSocket
		conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
		if err != nil {
			log.Printf("[WebSocket] Failed to upgrade connection: %v", err)
			return
		}

		// 生成客户端 ID
		clientID := uuid.New().String()

		// 创建新客户端
		client := NewClient(hub, conn, clientID)

		// 注册客户端到 hub
		hub.register <- client

		// 启动客户端的读写循环
		client.Start()

		log.Printf("[WebSocket] New client connected: %s", clientID)
	}
}

// GetStatus 获取 WebSocket 状态
func GetStatus(hub *Hub) gin.HandlerFunc {
	return func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"connected_clients": hub.GetClientCount(),
			"status":            "running",
		})
	}
}
