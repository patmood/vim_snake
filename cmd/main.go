package main

import (
	"log"
	"net/http"

	"github.com/labstack/echo/v5"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/rest"
)

func main() {
	app := pocketbase.New()

	app.OnBeforeServe().Add(func(e *core.ServeEvent) error {
		// Static file server for the website
		e.Router.Static("", "dist")

		scoreHandler, err := handleScore(app)
		if err != nil {
			return err
		}
		e.Router.AddRoute(echo.Route{
			Method:  http.MethodPost,
			Path:    "/score",
			Handler: scoreHandler,
		})

		return nil
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}

func handleScore(app *pocketbase.PocketBase) (echo.HandlerFunc, error) {
	scoreCollection, err := app.Dao().FindCollectionByNameOrId("scores")
	if err != nil {
		return nil, err
	}

	return func(c echo.Context) error {
		record, err := app.Dao().FindFirstRecordByData(scoreCollection, "displayName", "WhereIsMyHause")
		if err != nil {
			return rest.NewNotFoundError("", err)
		}
		return c.JSON(200, record.Data())
	}, nil
}
