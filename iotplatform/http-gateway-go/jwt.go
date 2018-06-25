package main

import (
	"crypto/rsa"
	"io/ioutil"

	jwt "github.com/dgrijalva/jwt-go"
)

const (
	pubKeyPath = "/etc/.keys/jwtRS256.key.pub" // openssl rsa -in app.rsa -pubout > app.rsa.pub
)

func LoadPublicKey() *rsa.PublicKey {
	bytes, err := ioutil.ReadFile(pubKeyPath)
	if err != nil {
		panic(err)
	}

	key, err := jwt.ParseRSAPublicKeyFromPEM(bytes)
	if err != nil {
		panic(err)
	}

	return key
}
