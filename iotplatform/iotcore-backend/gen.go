package main

import (
	"crypto/x509"
	"encoding/pem"
	"os"
	"time"

	"github.com/Sirupsen/logrus"
	"github.com/heldic/iotplatform/iotplatform/iotcore-backend/ssl"
	"github.com/urfave/cli"
)

var flags = []cli.Flag{
	cli.StringFlag{
		Name:  "client_id",
		Usage: "--client_id producer_1",
		Value: "producer_1",
	},
}

func gen(c *cli.Context) {
	ca := ssl.LoadCertificateAuthority("ca.crt", "ca.pem")
	cert_s, _, priv := ca.GenerateSignedCert(c.String("client_id"), time.Now().AddDate(10, 0, 0))

	// Public key
	certOut, err := os.Create(c.String("client_id") + ".crt")
	if err != nil {
		logrus.Println(err)
		return
	}
	pem.Encode(certOut, &pem.Block{Type: "CERTIFICATE", Bytes: cert_s})
	certOut.Close()
	logrus.Println("written cert.pem")

	// Private key
	keyOut, err := os.OpenFile(c.String("client_id")+".key", os.O_WRONLY|os.O_CREATE|os.O_TRUNC, 0600)
	if err != nil {
		logrus.Println(err)
		return
	}
	pem.Encode(keyOut, &pem.Block{Type: "RSA PRIVATE KEY", Bytes: x509.MarshalPKCS1PrivateKey(priv)})
	keyOut.Close()
	logrus.Println("written key.pem")
}
