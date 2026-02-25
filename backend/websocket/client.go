package websocket

import (
	"encoding/json"
	"log"
	"time"

	"github.com/gorilla/websocket"
)

const (
	// 允许向对等方写入消息的时间
	writeWait = 10 * time.Second

	// 允许从对等方读取下一个 pong 消息的时间
	pongWait = 60 * time.Second

	// 在此期间向对等方发送 ping。必须小于 pongWait
	pingPeriod = (pongWait * 9) / 10

	// 允许从对等方读取的最大消息大小
	maxMessageSize = 512
)

// Client 表示单个 WebSocket 客户端
type Client struct {
	// 客户端 ID
	id string

	// Hub
	hub *Hub

	// WebSocket 连接
	conn *websocket.Conn

	// 出站消息的缓冲通道
	send chan []byte
}

// NewClient 创建新的客户端实例
func NewClient(hub *Hub, conn *websocket.Conn, clientID string) *Client {
	return &Client{
		id:   clientID,
		hub:  hub,
		conn: conn,
		send: make(chan []byte, 256),
	}
}

// readPump 从 WebSocket 连接读取消息并发送到 hub
func (c *Client) readPump() {
	defer func() {
		c.hub.unregister <- c
		c.conn.Close()
	}()

	c.conn.SetReadDeadline(time.Now().Add(pongWait))
	c.conn.SetReadLimit(maxMessageSize)
	c.conn.SetPongHandler(func(string) error {
		c.conn.SetReadDeadline(time.Now().Add(pongWait))
		return nil
	})

	for {
		_, message, err := c.conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("[WebSocket] Error reading message: %v", err)
			}
			break
		}

		// 处理客户端消息
		c.handleMessage(message)
	}
}

// writePump 从 hub 向 WebSocket 连接写入消息
func (c *Client) writePump() {
	ticker := time.NewTicker(pingPeriod)
	defer func() {
		ticker.Stop()
		c.conn.Close()
	}()

	for {
		select {
		case message, ok := <-c.send:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if !ok {
				// Hub 关闭了通道
				c.conn.WriteMessage(websocket.CloseMessage, []byte{})
				return
			}

			w, err := c.conn.NextWriter(websocket.TextMessage)
			if err != nil {
				return
			}
			w.Write(message)

			// 将排队的消息添加到当前 WebSocket 消息
			n := len(c.send)
			for i := 0; i < n; i++ {
				w.Write([]byte{'\n'})
				w.Write(<-c.send)
			}

			if err := w.Close(); err != nil {
				return
			}

		case <-ticker.C:
			c.conn.SetWriteDeadline(time.Now().Add(writeWait))
			if err := c.conn.WriteMessage(websocket.PingMessage, nil); err != nil {
				return
			}
		}
	}
}

// handleMessage 处理来自客户端的消息
func (c *Client) handleMessage(message []byte) {
	var msg map[string]interface{}
	if err := json.Unmarshal(message, &msg); err != nil {
		log.Printf("[WebSocket] Failed to unmarshal message: %v", err)
		return
	}

	msgType, ok := msg["type"].(string)
	if !ok {
		return
	}

	switch msgType {
	case "ping":
		// 响应 ping
		c.sendPong()
	case "subscribe":
		// 处理订阅请求
		c.handleSubscribe(msg)
	default:
		log.Printf("[WebSocket] Unknown message type: %s", msgType)
	}
}

// sendPong 发送 pong 响应
func (c *Client) sendPong() {
	response := map[string]interface{}{
		"type":      "pong",
		"timestamp": time.Now().Unix(),
	}

	jsonData, err := json.Marshal(response)
	if err != nil {
		return
	}

	select {
	case c.send <- jsonData:
	default:
	}
}

// handleSubscribe 处理订阅请求
func (c *Client) handleSubscribe(msg map[string]interface{}) {
	// 这里可以实现特定频道的订阅逻辑
	// 暂时只是记录
	log.Printf("[WebSocket] Client %s subscribed to: %v", c.id, msg)
}

// Start 启动客户端的读写循环
func (c *Client) Start() {
	go c.writePump()
	go c.readPump()
}
