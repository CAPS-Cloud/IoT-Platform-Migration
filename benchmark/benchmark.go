package main

import (
	"context"
	"log"
	"net/http"
	"net/url"
	"sync"
	"time"

	"github.com/gorilla/websocket"
	"github.com/urfave/cli"
	"golang.org/x/sync/errgroup"
)

var flags = []cli.Flag{
	// Environment
	cli.StringFlag{
		Name:  "host",
		Value: "159.69.52.0:8766",
	},
	cli.IntFlag{
		Name:  "rate",
		Value: 1000,
	},
	cli.IntFlag{
		Name:  "max_conn",
		Value: 10000,
	},
	cli.IntFlag{
		Name:  "messages",
		Value: 1000,
	},
	cli.IntFlag{
		Name:  "period",
		Value: 500,
	},
}

func benchmark(c *cli.Context) {
	/*
		go func() {
			http.HandleFunc("/", echo)
			http.ListenAndServe("localhost:8080", nil)
		}()
	*/
	step := 0
	for {
		step += c.Int("rate")
		clients := []*Client{}
		ctx, _ := context.WithCancel(context.Background())
		g, _ := errgroup.WithContext(ctx)

		cstart := time.Now()
		for i := 0; i < step; i++ {
			client := &Client{
				Host:       c.String("host"),
				SendPeriod: c.Int("period"),
				Result:     Result{Number: int64(0), Total: int64(0), Low: int64(1000000000000000), High: int64(0)},
				Messages:   c.Int("messages"),
			}
			client.Connect()
			clients = append(clients, client)
		}
		ctime := time.Since(cstart).Seconds()
		log.Printf("connected %d, sending...", len(clients))

		rstart := time.Now()
		for _, client := range clients {
			g.Go(client.Run)
		}

		// wait for all errgroup goroutines
		if err := g.Wait(); err == nil {

		} else {
			log.Printf("%s", err.Error())
		}
		rtime := time.Since(rstart).Seconds()

		n := int64(0)
		m := int64(0)
		h := int64(0)
		l := int64(100000000000000000)
		for _, client := range clients {
			if client.Result.High >= h {
				h = client.Result.High
			}
			if client.Result.Low <= l {
				l = client.Result.High
			}
			n += client.Result.Number
			m += client.Result.Total
		}
		high := float64(h) / 1000000
		low := float64(l) / 1000000
		mean := float64(m) / float64(n) / 1000000

		log.Printf("clients: %d ctime: %f requests: %d rtime: %f s, mean: %f ms low: %f ms high: %f ms", len(clients), ctime, n, rtime, mean, low, high)

		if len(clients) >= c.Int("max_conn") {
			break
		}
	}

}

type Client struct {
	Conn       *websocket.Conn
	Host       string
	SendPeriod int
	Result     Result
	Messages   int
	Mutex      sync.Mutex
}

type Result struct {
	Number int64
	Total  int64
	Low    int64
	High   int64
}

func (client *Client) Connect() {
	u := url.URL{Scheme: "ws", Host: client.Host}

	header := http.Header{}
	header.Set("authentication", "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJpb3RwbGF0Zm9ybSIsInN1YiI6IjEyMzQ1IiwibmJmIjoxNTMxMTMyODA4LCJleHAiOjE1NjI2Njg4MDgsImlhdCI6MTUzMTEzMjgwOCwianRpIjoiaWQxMjM0NTYiLCJ0eXAiOiJodHRwczovL2lvdHBsYXRmb3JtLmNvbSJ9.dZoOJcfI2bd32FJtQoTtMt7AxlklFFbzmPdJQ3Q08JSvn82y4eje1MGFOQDa76HfyOUuvhxiw6kzxpH2i5bSP-KrJ-TsXfrlgY0YxX2SqNFVm7ArzYtH3auHpht8q3ZfNch3RbnDHDv2VyUNFeoYOWjBtveGQgk5I9Ox_bbYZ5EuBakTlahuv_PG3OSkq59626Usvzqo77XyWYPuHcsxTa-m3DBSBHufF95sbtDemjxQP5NhYkE_OM6ZZmRItxHEJqBVDEG9JI64ECnwi6XNcq3nk_CzJNXbEnivN42vIPzdodzDECsJr2say9hOJhvpAQMCdh3SYwN063rPMjf9aMIXYmilxh0y0uCo8w2E8RxoRw51gbDlDZiq3D1LXlAL2h6-3Zm21_ip1kKSzaT6DdYsjssns1ofl6xRY5bVZbEi9oNO7WxgWVCnSHQ2Xim8TsXCPvAczsiLehHCW-ZC6xHvU7yZ0n6QLC3Oo4VTA7gAR9R1B4tIpwKcuc6fo0hqZ24lUwtpcnahmC6CBv-WPQ07pED677PguqEk_NVXL6LAZHFcI9fFeQX7ubWAXwjGyv7xKnA88453k6ylczb6KuHGvc9FY351CRiBXDxu0wnl9j9lAJaTs7Mb-52A5UuANUhbaXgAD1uMhIA3xtJJ3wL_yq8LTurSHVOEAS9xFl8")
	c, _, err := websocket.DefaultDialer.Dial(u.String(), header)
	if err != nil {
		log.Fatal("dial:", err)
	}
	client.Conn = c
}

func (client *Client) Run() error {
	for i := 0; i < client.Messages; i++ {
		start := time.Now()
		err := client.Conn.WriteMessage(websocket.TextMessage, []byte("{\"sensor_id\": \"1231241541\", \"timestamp\": 1214125125, \"value\":\"12412421\"}"))
		if err != nil {
			log.Printf("%s", err.Error())
		}
		elapsed := time.Since(start).Nanoseconds()
		client.Result.Total += elapsed
		client.Result.Number++

		if client.Result.Low >= elapsed {
			client.Result.Low = elapsed
		}

		if client.Result.High <= elapsed {
			client.Result.High = elapsed
		}
	}
	return client.Conn.Close()
}

func (client *Client) Close() error {
	err := client.Conn.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.CloseNormalClosure, ""))
	if err != nil {
		log.Printf("%s", err.Error())
	}
	return client.Conn.Close()
}

var upgrader = websocket.Upgrader{} // use default options
func echo(w http.ResponseWriter, r *http.Request) {
	c, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Print("upgrade:", err)
		return
	}
	defer c.Close()
	for {
		mt, message, err := c.ReadMessage()
		if err != nil {
			log.Println("read:", err)
			break
		}
		log.Printf("recv: %s", message)
		err = c.WriteMessage(mt, message)
		if err != nil {
			log.Println("write:", err)
			break
		}
	}
}
