package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/joho/godotenv"
	"github.com/labstack/echo/v5"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/models"
	"github.com/pocketbase/pocketbase/tools/rest"
)

func main() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
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
	secret := os.Getenv("SCORE_SECRET")

	if len(secret) == 0 {
		log.Fatal("Missing SCORE_SECRET environment var")
	}
	scoreCollection, err := app.Dao().FindCollectionByNameOrId("scores")
	if err != nil {
		return nil, err
	}

	return func(c echo.Context) error {
		// TODO Get previous best score (maybe dont let them update if they cheated?)
		// record, _ := app.Dao().FindFirstRecordByData(scoreCollection, "displayName", displayName)

		displayName := c.FormValue("displayName")
		meta := c.FormValue("meta")
		sentScore := c.FormValue("score")
		timestamp := time.Now()

		cheater := false
		actualScore := xor(meta, secret)
		if sentScore != actualScore {
			cheater = true
			fmt.Print("Scores dont match!!!")
		}
		fmt.Printf("actualScore %s, meta %s, sentScore %s, displayName %s", actualScore, meta, sentScore, displayName)
		if len(displayName) == 0 || len(meta) == 0 || len(sentScore) == 0 {
			return rest.NewBadRequestError("missing fields", nil)
		}

		newRecord := models.NewRecord(scoreCollection)
		newRecord.SetDataValue("displayName", displayName)
		newRecord.SetDataValue("meta", meta)
		newRecord.SetDataValue("timestamp", timestamp)
		newRecord.SetDataValue("cheater", cheater)
		newRecord.SetDataValue("actualScore", actualScore)
		err := app.Dao().SaveRecord(newRecord)
		if err != nil {
			return rest.NewBadRequestError("", err)
		}
		return c.JSON(200, newRecord)
	}, nil
}

// Simple encryption
func xor(input, key string) (output string) {
	for i := 0; i < len(input); i++ {
		output += string(input[i] ^ key[i%len(key)])
	}
	return output
}
