package main

import (
	"crypto/rsa"
	"encoding/json"
	"io/ioutil"
	"log"
	"net/http"
	"strings"

	"github.com/Shopify/sarama"
	jwt "github.com/dgrijalva/jwt-go"
)

const pathDelimiter = "_"

type Gateway struct {
	PublicKey *rsa.PublicKey
	Producer  sarama.AsyncProducer
}

func (g *Gateway) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	// do authentication only if header field was set for performance testing
	if r.Header.Get("Authorization") != "" {
		// validate the token
		token, err := jwt.Parse(strings.Replace(r.Header.Get("Authorization"), "Bearer ", "", 1), func(token *jwt.Token) (interface{}, error) {
			// since we only use the one private key to sign the tokens,
			// we also only use its public counter part to verify
			return g.PublicKey, nil
		})

		if err != nil {
			log.Printf("Verify error: malformed token: %s", err)
			w.WriteHeader(http.StatusForbidden)
			w.Write([]byte("403 - JWT token malformed!"))
			return
		}

		if !token.Valid {
			log.Printf("Verify error: invalid token")
			w.WriteHeader(http.StatusForbidden)
			w.Write([]byte("403 - JWT token invalid!"))
			return
		}
		// log.Println("authorized")
	}

	body, err := ioutil.ReadAll(r.Body)
	if err != nil {
		log.Printf("malformed body: %s", err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	var message Message
	err = json.Unmarshal(body, &message)
	if err != nil {
		log.Printf("malformed message: deserialize: %s", err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	_, err = json.Marshal(message)
	if err != nil {
		log.Printf("malformed message: serialize: %s", err)
		w.WriteHeader(http.StatusBadRequest)
		return
	}

	// forward message to kafka
	// log.Printf("%v", message)
	//g.Producer.Input() <- &sarama.ProducerMessage{
	//	Topic: message.DeviceID + pathDelimiter + string(message.SensorID),
	//	Value: sarama.ByteEncoder(b),
	//}

	w.WriteHeader(http.StatusOK)

	return
}

func path(fragments ...string) string {
	path := ""
	for _, fragment := range fragments {
		path += fragment + pathDelimiter
	}
	path = strings.TrimSuffix(path, pathDelimiter)
	return path
}
