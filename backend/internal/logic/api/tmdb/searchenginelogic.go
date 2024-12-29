package tmdb

import (
	"context"

	"backend/internal/svc"
	"backend/internal/types"

	"github.com/zeromicro/go-zero/core/logx"
)

type SearchEngineLogic struct {
	logx.Logger
	ctx    context.Context
	svcCtx *svc.ServiceContext
}

func NewSearchEngineLogic(ctx context.Context, svcCtx *svc.ServiceContext) *SearchEngineLogic {
	return &SearchEngineLogic{
		Logger: logx.WithContext(ctx),
		ctx:    ctx,
		svcCtx: svcCtx,
	}
}

func (l *SearchEngineLogic) SearchEngine(req *types.TMDBBySearchEngineRequst) (resp *types.TMDBBySearchEngineResponse, err error) {
	// todo: add your logic here and delete this line

	return
}
