package logic

import (
	"context"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"backend/internal/svc"
	"backend/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type FilesLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewFilesLogic(ctx context.Context, svcCtx *svc.ServiceContext) *FilesLogic {
	return &FilesLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *FilesLogic) Files(req *types.FilesRequest) (*types.FilesResponse, error) {
	path := req.Path
	// 确保path不为空,默认为根目录
	if path == "" {
		path = "/"
	}

	// 规范化路径
	path = filepath.Clean(path)

	resp := &types.FilesResponse{
		Files: make([]types.FileInfo, 0),
	}

	entries, err := os.ReadDir(path)
	if err != nil {
		return nil, err
	}

	for _, entry := range entries {
		// 跳过隐藏文件
		if strings.HasPrefix(entry.Name(), ".") {
			continue
		}

		info, err := entry.Info()
		if err != nil {
			logx.WithContext(l.ctx).Errorf("Failed to get file info for %s: %v", entry.Name(), err)
			continue
		}

		fileType := "file"
		if entry.IsDir() {
			fileType = "folder"
		}

		fullPath := filepath.Join(path, entry.Name())
		resp.Files = append(resp.Files, types.FileInfo{
			ID:          fullPath,
			Name:        entry.Name(),
			Type:        fileType,
			Size:        info.Size(),
			Modified:    info.ModTime().Unix(),
			Permissions: info.Mode().String(),
			Path:        fullPath,
		})
	}

	// 排序：文件夹在前，同类型按名称排序
	sort.Slice(resp.Files, func(i, j int) bool {
		if resp.Files[i].Type != resp.Files[j].Type {
			return resp.Files[i].Type == "folder"
		}
		return resp.Files[i].Name < resp.Files[j].Name
	})

	return resp, nil
}
