package main

import (
	"crypto/rsa"
	"io/ioutil"
	"log"
	"net/http"

	"github.com/Shopify/sarama"
	jwt "github.com/dgrijalva/jwt-go"
)

type Gateway struct {
	PublicKey *rsa.PublicKey
	Producer  sarama.AsyncProducer
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

	// validate the token
	token, err := jwt.Parse("ey", func(token *jwt.Token) (interface{}, error) {
		// since we only use the one private key to sign the tokens,
		// we also only use its public counter part to verify
		return g.PublicKey, nil
	})

	if token.Valid {
		log.Println("valid token")
	} else {
		log.Println("invalid token")
	}

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
