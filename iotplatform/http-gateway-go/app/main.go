package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/Shopify/sarama"
	"github.com/samuel/go-zookeeper/zk"
	"github.com/valyala/fasthttp"
)

var (
	ENV_HTTP_PORT       string
	ENV_IOTCORE_BACKEND string
	ENV_ZOOKEEPER       string

	producer sarama.AsyncProducer
)

func main() {
	flag.StringVar(&ENV_HTTP_PORT, "port", "8089", "http port to listen to")
	flag.StringVar(&ENV_IOTCORE_BACKEND, "backend", "localhost:50051", "backend address incl. port")
	flag.StringVar(&ENV_ZOOKEEPER, "zookeeper", "localhost:2181", "zookeeper address incl. port")
	flag.Parse()

	c, _, err := zk.Connect([]string{ENV_ZOOKEEPER}, time.Second)
	if err != nil {
		panic(err)
	}
	children, _, err := c.Children("/brokers/ids")
	if err != nil {
		panic(err)
	}

	var brokerList []string
	for _, id := range children {
		info, _, _ := c.Get("/brokers/ids/" + string(id))
		var msgMapTemplate interface{}
		err := json.Unmarshal([]byte(info), &msgMapTemplate)
		if err != nil {
			fmt.Print(err)
			return
		}
		msgMap := msgMapTemplate.(map[string]interface{})
		for _, address := range msgMap["endpoints"].([]interface{}) {
			brokerList = append(brokerList, strings.Split(address.(string), "//")[1])
		}
	}

	config := sarama.NewConfig()
	config.Producer.RequiredAcks = sarama.WaitForLocal       // Only wait for the leader to ack
	config.Producer.Flush.Frequency = 500 * time.Millisecond // Flush batches every 500ms

	producer, err = sarama.NewAsyncProducer(brokerList, config)
	if err != nil {
		log.Fatalln("Failed to start Sarama producer:", err)
	}

	if err := fasthttp.ListenAndServe(":"+ENV_HTTP_PORT, MessageHandler); err != nil {
		log.Fatalf("Error in ListenAndServe: %s", err)
	}
}

func MessageHandler(ctx *fasthttp.RequestCtx) {
	/*
		deviceID := string(ctx.Request.Header.Peek("X-DEVICE-ID"))
		sensorFamily := string(ctx.Request.Header.Peek("X-SENSOR-FAMILY"))
		sensorID := string(ctx.Request.Header.Peek("X-SENSOR-ID"))
		fmt.Printf("%s %s %s", deviceID, sensorFamily, sensorID)
		token := strings.Replace(string(ctx.Request.Header.Peek("Authorization")), "Bearer ", "", -1)
		fmt.Println(token)
	*/
	producer.Input() <- &sarama.ProducerMessage{
		Topic: "livedata",
		Value: sarama.StringEncoder(ctx.Request.Body()),
	}

	// then update status code
	ctx.SetStatusCode(fasthttp.StatusOK)
	return
}
