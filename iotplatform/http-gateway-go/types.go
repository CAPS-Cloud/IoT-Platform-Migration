package main

type Message struct {
	Topic       string `json: "topic"`
	SensorID    string `json:"sensorId"`
	SensorGroup string `json:"sensorGroup"`
	Timestamp   int64  `json:"timestamp"`
	Value       string `json:"reading"`
}
