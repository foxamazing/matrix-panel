package crypto

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"io"
	"os"
)

// GetEncryptionKey 从环境变量获取加密密钥
func GetEncryptionKey() []byte {
	key := os.Getenv("ENCRYPTION_KEY")
	if key == "" {
		// 如果未设置,使用默认密钥(仅用于开发环境)
		key = "default-32byte-encryption-key!"
	}
	// 确保密钥长度为32字节(AES-256)
	if len(key) < 32 {
		key = key + "00000000000000000000000000000000"
	}
	return []byte(key[:32])
}

// EncryptSecret 使用AES-256-CBC加密敏感数据
func EncryptSecret(plaintext string) (string, error) {
	if plaintext == "" {
		return "", nil
	}

	key := GetEncryptionKey()
	block, err := aes.NewCipher(key)
	if err != nil {
		return "", err
	}

	// 添加PKCS7填充
	plainBytes := []byte(plaintext)
	padding := aes.BlockSize - len(plainBytes)%aes.BlockSize
	padText := append(plainBytes, make([]byte, padding)...)
	for i := 0; i < padding; i++ {
		padText[len(plainBytes)+i] = byte(padding)
	}

	// 生成随机IV
	ciphertext := make([]byte, aes.BlockSize+len(padText))
	iv := ciphertext[:aes.BlockSize]
	if _, err := io.ReadFull(rand.Reader, iv); err != nil {
		return "", err
	}

	// 加密
	mode := cipher.NewCBCEncrypter(block, iv)
	mode.CryptBlocks(ciphertext[aes.BlockSize:], padText)

	// Base64编码
	return base64.StdEncoding.EncodeToString(ciphertext), nil
}

// DecryptSecret 解密敏感数据
func DecryptSecret(ciphertext string) (string, error) {
	if ciphertext == "" {
		return "", nil
	}

	key := GetEncryptionKey()

	// Base64解码
	cipherBytes, err := base64.StdEncoding.DecodeString(ciphertext)
	if err != nil {
		return "", err
	}

	block, err := aes.NewCipher(key)
	if err != nil {
		return "", err
	}

	if len(cipherBytes) < aes.BlockSize {
		return "", errors.New("ciphertext too short")
	}

	// 提取IV
	iv := cipherBytes[:aes.BlockSize]
	cipherBytes = cipherBytes[aes.BlockSize:]

	// 解密
	mode := cipher.NewCBCDecrypter(block, iv)
	mode.CryptBlocks(cipherBytes, cipherBytes)

	// 移除PKCS7填充
	padding := int(cipherBytes[len(cipherBytes)-1])
	if padding > aes.BlockSize || padding == 0 {
		return "", errors.New("invalid padding")
	}
	plainBytes := cipherBytes[:len(cipherBytes)-padding]

	return string(plainBytes), nil
}
