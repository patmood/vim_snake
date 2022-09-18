package main

import (
	"log"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
)

func main() {
	app := pocketbase.New()

	app.OnBeforeServe().Add(func(e *core.ServeEvent) error {

		// Static file server for the website
		e.Router.Static("", "dist")

		// e.Router.AddRoute(echo.Route{
		// 	Method: http.MethodGet,
		// 	Path:   "/",
		// 	Handler: func(c echo.Context) error {
		// 		return c.String(200, "Hello world!")
		// 	},
		// })

		return nil
	})

	if err := app.Start(); err != nil {
		log.Fatal(err)
	}
}
