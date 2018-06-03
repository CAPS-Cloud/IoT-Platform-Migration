package ssl

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/tls"
	"crypto/x509"
	"crypto/x509/pkix"
	"math/big"
	"time"

	"github.com/Sirupsen/logrus"
)

type CertificateAuthority struct {
	Cert tls.Certificate
	X509 *x509.Certificate
}

func LoadCertificateAuthority(caPath, keyPath string) *CertificateAuthority {
	// Load CA
	catls, err := tls.LoadX509KeyPair(caPath, keyPath)
	if err != nil {
		panic(err)
	}
	ca, err := x509.ParseCertificate(catls.Certificate[0])
	if err != nil {
		panic(err)
	}

	return &CertificateAuthority{
		Cert: catls,
		X509: ca,
	}
}

func (ca *CertificateAuthority) GenerateSignedCert(commonName string, until time.Time) ([]byte, *rsa.PublicKey, *rsa.PrivateKey) {
	// "iotplatform", "DE", "BAY", "Munich", "Boltzmannstraße 3", "85748", time.Now().AddDate(10, 0, 0)
	cert, pub, priv := newCert(commonName, until)

	// Sign the certificate
	cert_s, err := x509.CreateCertificate(rand.Reader, cert, ca.X509, pub, ca.Cert.PrivateKey)
	if err != nil {
		logrus.Println(err)
		return nil, nil, nil
	}

	return cert_s, pub, priv
}

func newCert(commonName string, until time.Time) (*x509.Certificate, *rsa.PublicKey, *rsa.PrivateKey) {
	// Prepare certificate
	cert := &x509.Certificate{
		SerialNumber: big.NewInt(9900),
		Subject: pkix.Name{
			CommonName: commonName,
		},
		NotBefore:    time.Now(),
		NotAfter:     until,
		SubjectKeyId: []byte{1, 2, 3, 4, 6},
		ExtKeyUsage:  []x509.ExtKeyUsage{x509.ExtKeyUsageClientAuth, x509.ExtKeyUsageServerAuth},
		KeyUsage:     x509.KeyUsageDigitalSignature,
	}
	priv, _ := rsa.GenerateKey(rand.Reader, 2048)
	pub := &priv.PublicKey

	return cert, pub, priv
}
