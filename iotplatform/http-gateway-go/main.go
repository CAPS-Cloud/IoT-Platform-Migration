package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"log"
	"strings"
	"time"

	"github.com/samuel/go-zookeeper/zk"
	"github.com/valyala/fasthttp"
)

var (
	ENV_HTTP_PORT       string
	ENV_IOTCORE_BACKEND string
	ENV_ZOOKEEPER       string
)

func main() {
	flag.StringVar(&ENV_HTTP_PORT, "port", "8089", "http port to listen to")
	flag.StringVar(&ENV_IOTCORE_BACKEND, "backend", "localhost:50051", "backend address incl. port")
	flag.StringVar(&ENV_ZOOKEEPER, "zookeeper", "localhost:2181", "zookeeper address incl. port")
	flag.Parse()

	brokerList := GetBrokerList(ENV_ZOOKEEPER)
	log.Printf("%v", brokerList)
	gateway := NewHTTPGateway(brokerList)

	if err := fasthttp.ListenAndServe(":"+ENV_HTTP_PORT, gateway.MessageHandler); err != nil {
		log.Fatalf("Error in ListenAndServe: %s", err)
	}
}

func GetBrokerList(zookeeper string) []string {
	c, _, err := zk.Connect([]string{zookeeper}, time.Second)
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
			return []string{}
		}
		msgMap := msgMapTemplate.(map[string]interface{})
		for _, address := range msgMap["endpoints"].([]interface{}) {
			brokerList = append(brokerList, strings.Split(address.(string), "//")[1])
		}
	}
	return brokerList
}
