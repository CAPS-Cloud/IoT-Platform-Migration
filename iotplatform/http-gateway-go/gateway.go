package main

import (
	"io/ioutil"
	"log"
	"net/http"

	"github.com/Shopify/sarama"
)

type Gateway struct {
	Producer sarama.AsyncProducer
}

func (g *Gateway) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	/*
		deviceID := string(ctx.Request.Header.Peek("X-IOT-DEVICE-ID"))
		sensorFamily := string(ctx.Request.Header.Peek("X-IOT-SENSOR-FAMILY"))
		sensorID := string(ctx.Request.Header.Peek("X-IOT-SENSOR-ID"))
		fmt.Printf("%s %s %s", deviceID, sensorFamily, sensorID)
		token := strings.Replace(string(ctx.Request.Header.Peek("Authorization")), "Bearer ", "", -1)
		fmt.Println(token)
	*/
	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		panic(err)
	}
	log.Printf("%s", string(body))
	g.Producer.Input() <- &sarama.ProducerMessage{
		Topic: "livedata",
		Value: sarama.StringEncoder(body),
	}

	// then update status code
	//ctx.SetStatusCode(fasthttp.StatusOK)
	return
}
