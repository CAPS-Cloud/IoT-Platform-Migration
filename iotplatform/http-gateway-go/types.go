package main

type Message struct {
	DeviceID  string  `json: "device_id"`
	SensorID  int64   `json:"sensor_id"`
	Timestamp int64   `json:"timestamp"`
	Value     float64 `json:"value"`
}
