package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"time"

	_ "github.com/go-sql-driver/mysql"
	"github.com/gofiber/fiber/v2"
)

type Coin struct {
	Id       int
	Flag     string
	Name     string
	Category string
	Alloy    string
	Year     int
}

func newCoin(Id int, Flag string, Name string, Category string, Alloy string, Year int) Coin {
	e := Coin{Id, Flag, Name, Category, Alloy, Year}
	return e
}

func (coin Coin) toString() {
	fmt.Printf("Id: %d, Flag: %s ", coin.Id, coin.Flag)
}

func main() {

	db := try_connection()

	app := fiber.New()

	app.Static("/", "./static")

	app.Get("/", func(ctx *fiber.Ctx) error {
		return ctx.SendFile("./index.html")
	})

	app.Get("/coin", func(ctx *fiber.Ctx) error {
		coins, _ := read_databse(db)

		return ctx.JSON(coins)
	})

	app.Post("/coin", func(ctx *fiber.Ctx) error {
		var coin Coin = Coin{}
		json.Unmarshal(ctx.Body(), &coin)
		coin.toString()
		_ = insert_row(coin, db)
		return ctx.JSON(coin)
	})

	app.Put("/coin", func(ctx *fiber.Ctx) error {
		var coin Coin
		json.Unmarshal(ctx.Body(), &coin)

		_ = modify_row(coin, coin.Id, db)

		return ctx.JSON(coin)
	})

	app.Delete("/coin", func(ctx *fiber.Ctx) error {
		var id int
		json.Unmarshal(ctx.Body(), &id)
		_ = remove_row(id, db)
		_, coins := read_databse(db)
		return ctx.JSON(coins)
	})

	fmt.Print(app.Listen(":3000"))
}

func try_connection() *sql.DB {
	fmt.Print("Connecting...")
	db, err := sql.Open("mysql", "admin:admin@/monetki")
	if err != nil {
		panic(err)
	}

	db.SetConnMaxLifetime(time.Minute * 3)
	db.SetMaxOpenConns(10)
	db.SetMaxIdleConns(10)
	return db
}

func read_databse(db *sql.DB) ([]Coin, error) {
	rows, err := db.Query("SELECT * FROM monetki")
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	coins := make([]Coin, 0)
	for rows.Next() {
		var ID, Year int
		var Flag, Name, Category, Alloy string

		err := rows.Scan(&ID, &Flag, &Name, &Category, &Alloy, &Year)
		if err != nil {
			panic(err)
		}
		coins = append(coins, newCoin(ID, Flag, Name, Category, Alloy, Year))
	}
	return coins, nil
}

func insert_row(coin Coin, db *sql.DB) error {
	query := fmt.Sprintf("INSERT INTO monetki (`ID`, `Flag`, `Name`, `Category`, `Alloy`, `Year`) VALUES (%d, '%s', '%s', '%s', '%s', '%d')", coin.Id, coin.Flag, coin.Name, coin.Category, coin.Alloy, coin.Year)
	_, err := db.Exec(query)

	if err != nil {
		return err
	}

	return nil
}

func modify_row(coin Coin, id int, db *sql.DB) error {
	query := fmt.Sprintf("UPDATE monetki SET `ID`=%d, `Flag`='%s', `Name`='%s', `Category`='%s', `Alloy`='%s', `Year`='%d' WHERE `ID`=%d", coin.Id, coin.Flag, coin.Name, coin.Category, coin.Alloy, coin.Year, id)
	_, err := db.Exec(query)

	if err != nil {
		return err
	}

	return nil
}

func remove_row(id int, db *sql.DB) error {
	query := fmt.Sprintf("DELETE FROM monetki WHERE `ID`=%d", id)
	_, err := db.Exec(query)

	if err != nil {
		return err
	}

	return nil
}
