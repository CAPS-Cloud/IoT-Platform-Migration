package main

import (
	"log"
	"time"

	"github.com/Shopify/sarama"
	"github.com/valyala/fasthttp"
)

type Gateway struct {
	Producer sarama.AsyncProducer
}

func NewHTTPGateway(brokerList []string) *Gateway {
	config := sarama.NewConfig()
	config.Producer.RequiredAcks = sarama.WaitForLocal       // Only wait for the leader to ack
	config.Producer.Flush.Frequency = 500 * time.Millisecond // Flush batches every 500ms

	ticker := time.NewTicker(5 * time.Second)
	var producer sarama.AsyncProducer
	var err error
	for {
		producer, err = sarama.NewAsyncProducer(brokerList, config)
		if err != nil {
			log.Fatalln("Failed to connect to producer:", err)
		} else {
			continue
		}
		<-ticker.C
	}

	return &Gateway{
		Producer: producer,
	}
}

func (g *Gateway) MessageHandler(ctx *fasthttp.RequestCtx) {
	/*
		deviceID := string(ctx.Request.Header.Peek("X-IOT-DEVICE-ID"))
		sensorFamily := string(ctx.Request.Header.Peek("X-IOT-SENSOR-FAMILY"))
		sensorID := string(ctx.Request.Header.Peek("X-IOT-SENSOR-ID"))
		fmt.Printf("%s %s %s", deviceID, sensorFamily, sensorID)
		token := strings.Replace(string(ctx.Request.Header.Peek("Authorization")), "Bearer ", "", -1)
		fmt.Println(token)
	*/

	log.Printf("%s", string(ctx.Request.Body()))
	g.Producer.Input() <- &sarama.ProducerMessage{
		Topic: "livedata",
		Value: sarama.StringEncoder(ctx.Request.Body()),
	}

	// then update status code
	ctx.SetStatusCode(fasthttp.StatusOK)
	return
}
