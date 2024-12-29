// Code generated by goctl. DO NOT EDIT.
// goctl 1.7.3

package handler

import (
	"net/http"

	apitmdb "backend/internal/handler/api/tmdb"
	"backend/internal/svc"

	"github.com/zeromicro/go-zero/rest"
)

func RegisterHandlers(server *rest.Server, serverCtx *svc.ServiceContext) {
	server.AddRoutes(
		[]rest.Route{
			{
				Method:  http.MethodGet,
				Path:    "/searchengine",
				Handler: apitmdb.SearchEngineHandler(serverCtx),
			},
		},
	)
}
