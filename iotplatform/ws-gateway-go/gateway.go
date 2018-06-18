package main

import (
	"log"
	"net/http"

	"github.com/Shopify/sarama"
	"github.com/gobwas/ws"
	"github.com/gobwas/ws/wsutil"
)

type Gateway struct {
	Producer sarama.AsyncProducer
}

func (g *Gateway) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	conn, _, _, err := ws.UpgradeHTTP(r, w, nil)
	if err != nil {
		// handle error
	}

	go func() {
		defer conn.Close()

		for {
			/*
				deviceID := string(ctx.Request.Header.Peek("X-IOT-DEVICE-ID"))
				sensorFamily := string(ctx.Request.Header.Peek("X-IOT-SENSOR-FAMILY"))
				sensorID := string(ctx.Request.Header.Peek("X-IOT-SENSOR-ID"))
				fmt.Printf("%s %s %s", deviceID, sensorFamily, sensorID)
				token := strings.Replace(string(ctx.Request.Header.Peek("Authorization")), "Bearer ", "", -1)
				fmt.Println(token)
			*/

			msg, op, err := wsutil.ReadClientData(conn)
			if err != nil {
				// handle error
			}
			log.Printf("%s %v", string(msg), op)
			g.Producer.Input() <- &sarama.ProducerMessage{
				Topic: "livedata",
				Value: sarama.StringEncoder(msg),
			}
		}
	}()
}
