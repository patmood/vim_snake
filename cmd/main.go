package main

import (
	"crypto/aes"
	"crypto/cipher"
	"encoding/base64"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/joho/godotenv"
	"github.com/labstack/echo/v5"
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
	scoreCollection, err := app.Dao().FindCollectionByNameOrId("scores")
	if err != nil {
		return nil, err
	}

	return func(c echo.Context) error {
		// TODO Get previous best score (maybe dont let them update if they cheated?)
		// record, _ := app.Dao().FindFirstRecordByData(scoreCollection, "displayName", displayName)
		user := c.Get(apis.ContextUserKey).(*models.User)

		displayName := user.Profile.GetStringDataValue("name")
		meta := c.FormValue("meta")
		sentScore := c.FormValue("score")
		timestamp := time.Now()

		cheater := false
		unencrypted, err1 := Decrypt(meta, secret)
		if err1 != nil {
			rest.NewBadRequestError("decryption failed", err1)
		}

		gameImage := unencrypted[10:]
		actualScore := strings.TrimLeft(unencrypted[:10], "0")
		if sentScore != actualScore {
			cheater = true
			fmt.Print("Scores dont match!!!")
		}
		fmt.Printf("actualScore %s, sentScore %s, displayName %s", actualScore, sentScore, displayName)
		if len(displayName) == 0 || len(meta) == 0 || len(sentScore) == 0 {
			return rest.NewBadRequestError("missing fields", nil)
		}

		newRecord := models.NewRecord(scoreCollection)
		newRecord.SetDataValue("displayName", user.Profile.GetStringDataValue("name"))
		newRecord.SetDataValue("picture", user.Profile.GetStringDataValue("avatarUrl"))
		newRecord.SetDataValue("meta", meta)
		newRecord.SetDataValue("timestamp", timestamp)
		newRecord.SetDataValue("cheater", cheater)
		newRecord.SetDataValue("score", actualScore)
		newRecord.SetDataValue("gameImage", gameImage)
		newRecord.SetDataValue("user", user.Id)
		err := app.Dao().SaveRecord(newRecord)
		if err != nil {
			return rest.NewBadRequestError("", err)
		}
		return c.JSON(200, newRecord)
	}, nil
}

// Encryption code
// ==============================
var bytes = []byte{35, 46, 57, 24, 85, 35, 24, 74, 87, 35, 88, 98, 66, 32, 14, 05}

func Encode(b []byte) string {
	return base64.StdEncoding.EncodeToString(b)
}
func Decode(s string) []byte {
	data, err := base64.StdEncoding.DecodeString(s)
	if err != nil {
		panic(err)
	}
	return data
}

// Encrypt method is to encrypt or hide any classified text
func Encrypt(text, MySecret string) (string, error) {
	block, err := aes.NewCipher([]byte(MySecret))
	if err != nil {
		return "", err
	}
	plainText := []byte(text)
	cfb := cipher.NewCFBEncrypter(block, bytes)
	cipherText := make([]byte, len(plainText))
	cfb.XORKeyStream(cipherText, plainText)
	return Encode(cipherText), nil
}

// Decrypt method is to extract back the encrypted text
func Decrypt(text, MySecret string) (string, error) {
	block, err := aes.NewCipher([]byte(MySecret))
	if err != nil {
		return "", err
	}
	cipherText := Decode(text)
	cfb := cipher.NewCFBDecrypter(block, bytes)
	plainText := make([]byte, len(cipherText))
	cfb.XORKeyStream(plainText, cipherText)
	return string(plainText), nil
}
