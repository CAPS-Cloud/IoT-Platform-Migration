package main

import (
	"crypto/rsa"
	"encoding/json"
	"log"
	"net/http"
	"strings"

	"github.com/Shopify/sarama"
	jwt "github.com/dgrijalva/jwt-go"
	"github.com/gorilla/websocket"
)

const pathDelimiter = "_"

var upgrader = websocket.Upgrader{} // use default options

type Gateway struct {
	PublicKey *rsa.PublicKey
	Producer  sarama.AsyncProducer
}

func (g *Gateway) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	c, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Print("upgrade:", err)
		return
	}
	defer c.Close()
	// do authentication only if header field was set for performance testing
	if r.Header.Get("authorization") != "" {
		// validate the token
		token, err := jwt.Parse(strings.Replace(r.Header.Get("authorization"), "Bearer ", "", 1), func(token *jwt.Token) (interface{}, error) {
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
	}

	for {
		_, msg, err := c.ReadMessage()
		if err != nil {
			log.Printf("malformed message: read: %s", err)
			break
		}

		var message Message
		var messages []Message
		err = json.Unmarshal(msg, &message)
		if err != nil {
			err = json.Unmarshal(msg, &messages)
			if err != nil {
				log.Printf("malformed message: deserialize: %s", err)
				break
			}
			for _, message := range messages {
				_, err = json.Marshal(message)
				if err != nil {
					log.Printf("malformed message: serialize: %s", err)
					break
				}
			}
		} else {
			_, err = json.Marshal(message)
			if err != nil {
				log.Printf("malformed message: serialize: %s", err)
				break
			}
		}
	}
}
