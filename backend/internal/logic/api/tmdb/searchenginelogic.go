package tmdb

import (
	"context"
	"fmt"
	"html"
	"io"
	"net/http"
	"net/url"
	"regexp"
	"strings"

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
	name, err := l.getFirstResultTitle(req.Query)
	if err != nil {
		return nil, err
	}

	resp = &types.TMDBBySearchEngineResponse{
		Name: name,
	}
	return resp, nil
}

func (l *SearchEngineLogic) getFirstResultTitle(query string) (string, error) {
	searchQuery := query + " TMDB"
	encodedQuery := url.QueryEscape(searchQuery)
	searchURL := "https://www.google.com/search?q=" + encodedQuery

	resp, err := http.Get(searchURL)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", err
	}

	re := regexp.MustCompile(`<div class="BNeawe vvjwJb AP7Wnd">(.*?)</div>`)
	matches := re.FindSubmatch(body)
	if len(matches) < 2 {
		return "", fmt.Errorf("没找到搜索结果")
	}

	// 清理标题
	title := string(matches[1])

	// 解码 HTML 实体
	title = html.UnescapeString(title)

	// 移除 TMDB 相关后缀
	title = strings.TrimSuffix(title, " - The Movie Database")
	title = strings.TrimSuffix(title, " — The Movie Database (TMDB)")
	title = strings.TrimSuffix(title, " | The Movie Database (TMDb)")

	// 移除年份
	yearRegex := regexp.MustCompile(`\s*\(\d{4}\)\s*`)
	title = yearRegex.ReplaceAllString(title, "")

	return strings.TrimSpace(title), nil
}
