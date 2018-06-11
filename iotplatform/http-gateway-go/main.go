package main

import (
	"encoding/json"
	"flag"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/Shopify/sarama"
	"github.com/samuel/go-zookeeper/zk"
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

	var brokerList []string
	var producer sarama.AsyncProducer
	var err error
	ticker := time.NewTicker(5 * time.Second)
	// connect to zookeeper retry
	for {
		brokerList, err = GetBrokerList(ENV_ZOOKEEPER)
		if err != nil {
			log.Printf("zookeper: %s", err.Error())
		}
		if len(brokerList) > 0 {
			log.Printf("zookeeper: brokers retrieved %v", brokerList)
			break
		} else {
			log.Print("zookeper: no brokers retrieved")
		}
		<-ticker.C
	}

	// connect kafka retry
	for {
		producer, err = GetKafkaProducer(brokerList)
		if err != nil {
			log.Printf("kafka: %s", err.Error())
		} else {
			log.Printf("kafka: connected")
			break
		}
		<-ticker.C
	}

	gateway := &Gateway{
		Producer: producer,
	}

	// listen for http requests
	if err := http.ListenAndServe(":"+ENV_HTTP_PORT, gateway); err != nil {
		log.Fatalf("Error in ListenAndServe: %s", err)
	}
}

func GetBrokerList(zookeeper string) ([]string, error) {
	c, _, err := zk.Connect([]string{zookeeper}, time.Second)
	if err != nil {
		return []string{}, err
	}
	children, _, err := c.Children("/brokers/ids")
	if err != nil {
		return []string{}, err
	}

	var brokerList []string
	for _, id := range children {
		info, _, _ := c.Get("/brokers/ids/" + string(id))
		var msgMapTemplate interface{}
		err := json.Unmarshal([]byte(info), &msgMapTemplate)
		if err != nil {
			log.Print(err.Error())
		}
		msgMap := msgMapTemplate.(map[string]interface{})
		for _, address := range msgMap["endpoints"].([]interface{}) {
			brokerList = append(brokerList, strings.Split(address.(string), "//")[1])
		}
	}
	return brokerList, nil
}

func GetKafkaProducer(brokerList []string) (sarama.AsyncProducer, error) {
	config := sarama.NewConfig()
	config.Producer.RequiredAcks = sarama.WaitForLocal       // Only wait for the leader to ack
	config.Producer.Flush.Frequency = 500 * time.Millisecond // Flush batches every 500ms

	producer, err := sarama.NewAsyncProducer(brokerList, config)
	if err != nil {
		return nil, err
	}
	return producer, nil
}
