package main

type Message struct {
	SensorID  string `json:"sensor_id"`
	Timestamp int64  `json:"timestamp"`
	Value     string `json:"value"`
}
