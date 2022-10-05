package migrations

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"time"

	"github.com/pocketbase/pocketbase/models"

	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/daos"
	m "github.com/pocketbase/pocketbase/migrations"
)

type OldScore struct {
	DisplayName string `json:"displayName"`
	Score       int    `json:"score"`
	GameImage   string `json:"gameImage"`
	Cheater     bool   `json:"cheater"`
	AvatarUrl   string `json:"picture"`
	Timestamp   struct {
		Seconds int64 `json:"seconds"`
	}
}

func init() {
	m.Register(func(db dbx.Builder) error {
		// add up queries...
		jsonStr, err := ioutil.ReadFile("./migrations/scores.json")
		if err != nil {
			log.Fatal(err)
		}

		var dat []OldScore

		err = json.Unmarshal(jsonStr, &dat)
		if err != nil {
			log.Fatal("Error during Unmarshal(): ", err)
		}
		timestamp := time.Now()
		fmt.Println(timestamp)

		dao := daos.New(db)
		scoreCollection, err := dao.FindCollectionByNameOrId("scores")
		if err != nil {
			log.Fatal(err)
		}

		for _, score := range dat {
			newRecord := models.NewRecord(scoreCollection)

			newRecord.SetDataValue("displayName", score.DisplayName)
			newRecord.SetDataValue("avatarUrl", score.AvatarUrl)
			newRecord.SetDataValue("authProvider", "twitter")
			newRecord.SetDataValue("timestamp", time.Unix(score.Timestamp.Seconds, 0))
			newRecord.SetDataValue("score", score.Score)
			newRecord.SetDataValue("gameImage", score.GameImage)
			newRecord.SetDataValue("user", nil)

			err = dao.SaveRecord(newRecord)
			if err != nil {
				log.Fatal(err)
			}
		}

		return nil
	}, func(db dbx.Builder) error {
		// add down queries...

		return nil
	})
}
