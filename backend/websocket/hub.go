package websocket

import (
	"encoding/json"
	"log"
	"sync"
	"time"
)

// Hub 维护活跃的客户端集合并向客户端广播消息
type Hub struct {
	// 注册的客户端
	clients map[*Client]bool

	// 来自客户端的入站消息
	broadcast chan []byte

	// 客户端注册请求
	register chan *Client

	// 客户端注销请求
	unregister chan *Client

	// 互斥锁保护并发访问
	mu sync.RWMutex
}

// NewHub 创建新的 Hub 实例
func NewHub() *Hub {
	return &Hub{
		broadcast:  make(chan []byte, 256),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		clients:    make(map[*Client]bool),
	}
}

// Run 启动 Hub 的主循环
func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client] = true
			h.mu.Unlock()
			log.Printf("[WebSocket] Client registered: %s", client.id)

		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client]; ok {
				delete(h.clients, client)
				close(client.send)
				log.Printf("[WebSocket] Client unregistered: %s", client.id)
			}
			h.mu.Unlock()

		case message := <-h.broadcast:
			h.mu.RLock()
			for client := range h.clients {
				select {
				case client.send <- message:
				default:
					// 客户端发送缓冲区已满，关闭连接
					close(client.send)
					delete(h.clients, client)
					log.Printf("[WebSocket] Client send buffer full, disconnected: %s", client.id)
				}
			}
			h.mu.RUnlock()
		}
	}
}

// Broadcast 向所有连接的客户端广播消息
func (h *Hub) Broadcast(messageType string, data interface{}) {
	message := map[string]interface{}{
		"type":      messageType,
		"data":      data,
		"timestamp": time.Now().Unix(),
	}

	jsonData, err := json.Marshal(message)
	if err != nil {
		log.Printf("[WebSocket] Failed to marshal message: %v", err)
		return
	}

	h.broadcast <- jsonData
}

// BroadcastSystemStats 广播系统状态
func (h *Hub) BroadcastSystemStats(stats interface{}) {
	h.Broadcast("system-stats", stats)
}

// BroadcastWidgetUpdate 广播 Widget 更新
func (h *Hub) BroadcastWidgetUpdate(widgetID string, data interface{}) {
	h.Broadcast("widget-update", map[string]interface{}{
		"widgetId": widgetID,
		"data":     data,
	})
}

// GetClientCount 获取当前连接的客户端数量
func (h *Hub) GetClientCount() int {
	h.mu.RLock()
	defer h.mu.RUnlock()
	return len(h.clients)
}
