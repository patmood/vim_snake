package main

import (
	"log"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"
	_ "vim-snake/migrations"
	"vim-snake/utils"

	"github.com/joho/godotenv"
	"github.com/labstack/echo/v5"
	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
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
		e.Router.Static("", "pb_public")

		scoreHandler, err := handleScore(app)
		if err != nil {
			return err
		}
		e.Router.AddRoute(echo.Route{
			Method:  http.MethodPost,
			Path:    "/score",
			Handler: scoreHandler,
			Middlewares: []echo.MiddlewareFunc{
				apis.RequireAdminOrUserAuth(),
			},
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

	return func(c echo.Context) error {
		scoreCollection, err := app.Dao().FindCollectionByNameOrId("scores")
		if err != nil {
			log.Fatal("Missing scores collection")
		}
		user := c.Get(apis.ContextUserKey).(*models.User)
		prevScoreRecords, _ := app.Dao().FindRecordsByExpr(scoreCollection, dbx.NewExp("[[user]] = {:userid}", dbx.Params{"userid": user.Id}))
		var prevScoreRecord *models.Record
		if len(prevScoreRecords) > 0 {
			prevScoreRecord = prevScoreRecords[0]
		}

		displayName := user.Profile.GetStringDataValue("name")
		meta := c.FormValue("meta")
		sentScore := c.FormValue("score")
		timestamp := time.Now()

		sentScoreInt, _ := strconv.Atoi(sentScore)
		if prevScoreRecord != nil && prevScoreRecord.GetIntDataValue("score") > sentScoreInt {
			return c.JSON(200, prevScoreRecord)
		}

		unencrypted, err1 := utils.Decrypt(meta, secret)
		if err1 != nil {
			return rest.NewBadRequestError("decryption failed", err1)
		}

		gameImage := unencrypted[10:]
		actualScore := strings.TrimLeft(unencrypted[:10], "0")
		if sentScore != actualScore {
			// Cheater!
			profile := user.Profile
			profile.SetDataValue("cheater", true)
			err = app.Dao().SaveRecord(profile)
			if err != nil {
				log.Println("Failed to save cheater", err)
			}
			return rest.NewApiError(418, " https://youtu.be/z0O32YA4Ibs?t=48 ", nil)
		}

		if len(displayName) == 0 || len(meta) == 0 || len(sentScore) == 0 {
			return rest.NewBadRequestError("missing fields", nil)
		}

		newRecord := models.NewRecord(scoreCollection)
		if prevScoreRecord != nil {
			newRecord.SetId(prevScoreRecord.Id)
		}
		newRecord.SetDataValue("displayName", user.Profile.GetStringDataValue("name"))
		newRecord.SetDataValue("avatarUrl", user.Profile.GetStringDataValue("avatarUrl"))
		newRecord.SetDataValue("authProvider", user.Profile.GetStringDataValue("authProvider"))
		newRecord.SetDataValue("timestamp", timestamp)
		newRecord.SetDataValue("score", actualScore)
		newRecord.SetDataValue("gameImage", gameImage)
		newRecord.SetDataValue("user", user.Id)
		err = app.Dao().SaveRecord(newRecord)
		if err != nil {
			return rest.NewBadRequestError("", err)
		}
		return c.JSON(200, newRecord)
	}, nil
}
