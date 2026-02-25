package assets

import (
	"embed"
	"strings"
)

//go:embed *
var assetsFS embed.FS

// Asset loads and returns the asset for the given name.
// It returns an error if the asset could not be found or could not be loaded.
func Asset(name string) ([]byte, error) {
	// The caller passes paths like "assets/version", but in this package (backend/assets),
	// the file is just "version".
	// We trim the "assets/" prefix to match the embed FS structure.
	nameInFS := strings.TrimPrefix(name, "assets/")
	nameInFS = strings.TrimPrefix(nameInFS, "/")

	return assetsFS.ReadFile(nameInFS)
}
