package main

type Message struct {
	DeviceID  string `json: "device_id"`
	SensorID  string `json:"sensor_id"`
	Timestamp int64  `json:"timestamp"`
	Value     string `json:"value"`
}
