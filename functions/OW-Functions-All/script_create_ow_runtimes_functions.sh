
cd AuthenticationApp
docker build -f DockerfileOW -t iotplatformcaps/owruntime_authapp:runtime .
docker push iotplatformcaps/owruntime_authapp:runtime

cd ../UserControllerGetAll
docker build -f DockerfileOW -t iotplatformcaps/owruntime_usercontrollergetall:runtime .
docker push iotplatformcaps/owruntime_usercontrollergetall:runtime

cd ../UserControllerSignin
docker build -f DockerfileOW -t iotplatformcaps/owruntime_usercontrollersignin:runtime .
docker push iotplatformcaps/owruntime_usercontrollersignin:runtime

cd ../UserControllerSelf
docker build -f DockerfileOW -t iotplatformcaps/owruntime_usercontrollerself:runtime .
docker push iotplatformcaps/owruntime_usercontrollerself:runtime

cd ../UserControllerAdd
docker build -f DockerfileOW -t iotplatformcaps/owruntime_usercontrolleradd:runtime .
docker push iotplatformcaps/owruntime_usercontrolleradd:runtime

cd ../UserControllerUpdate
docker build -f DockerfileOW -t iotplatformcaps/owruntime_usercontrollerupdate:runtime .
docker push iotplatformcaps/owruntime_usercontrollerupdate:runtime

cd ../UserControllerDelete
docker build -f DockerfileOW -t  iotplatformcaps/owruntime_usercontrollerdelete:runtime .
docker push iotplatformcaps/owruntime_usercontrollerdelete:runtime

cd ../DeviceControllerGetAll
docker build -f DockerfileOW -t  iotplatformcaps/owruntime_devicecontrollergetall:runtime .
docker push iotplatformcaps/owruntime_devicecontrollergetall:runtime

cd ../DeviceControllerAdd
docker build -f DockerfileOW -t iotplatformcaps/owruntime_devicecontrolleradd:runtime .
docker push iotplatformcaps/owruntime_devicecontrolleradd:runtime

cd ../DeviceControllerUpdate
docker build -f DockerfileOW -t iotplatformcaps/owruntime_devicecontrollerupdate:runtime .
docker push iotplatformcaps/owruntime_devicecontrollerupdate:runtime

cd ../DeviceControllerDelete
docker build -f DockerfileOW -t iotplatformcaps/owruntime_devicecontrollerdelete:runtime .
docker push iotplatformcaps/owruntime_devicecontrollerdelete:runtime

cd ../DeviceControllerKey
docker build -f DockerfileOW -t iotplatformcaps/owruntime_devicecontrollerkey:runtime .
docker push iotplatformcaps/owruntime_devicecontrollerkey:runtime

cd ../ConsumerControllerGetAll
docker build -f DockerfileOW -t iotplatformcaps/owruntime_consumercontrollergetall:runtime .
docker push iotplatformcaps/owruntime_consumercontrollergetall:runtime

cd ../ConsumerControllerAdd
docker build -f DockerfileOW -t iotplatformcaps/owruntime_consumercontrolleradd:runtime .
docker push iotplatformcaps/owruntime_consumercontrolleradd:runtime

cd ../ConsumerControllerUpdate
docker build -f DockerfileOW -t iotplatformcaps/owruntime_consumercontrollerupdate:runtime .
docker push iotplatformcaps/owruntime_consumercontrollerupdate:runtime

cd ../ConsumerControllerKey
docker build -f DockerfileOW -t iotplatformcaps/owruntime_consumercontrollerkey:runtime .
docker push iotplatformcaps/owruntime_consumercontrollerkey:runtime

cd ../ConsumerControllerDelete
docker build -f DockerfileOW -t iotplatformcaps/owruntime_consumercontrollerdelete:runtime .
docker push iotplatformcaps/owruntime_consumercontrollerdelete:runtime

cd ../SensorGetAll
docker build -f DockerfileOW -t iotplatformcaps/owruntime_sensorgetall:runtime .
docker push iotplatformcaps/owruntime_sensorgetall:runtime

cd ../SensorUpdate
docker build -f DockerfileOW -t iotplatformcaps/owruntime_sensorupdate:runtime .
docker push iotplatformcaps/owruntime_sensorupdate:runtime

cd ../SensorDelete
docker build -f DockerfileOW -t iotplatformcaps/owruntime_sensordelete:runtime .
docker push iotplatformcaps/owruntime_sensordelete:runtime

cd ../ConsumersSensorsEnablePermissions
docker build -f DockerfileOW -t iotplatformcaps/owruntime_consumersensorsenablepermissions:runtime .
docker push iotplatformcaps/owruntime_consumersensorsenablepermissions:runtime

cd ../ConsumersSensorsDisablePermissions
docker build -f DockerfileOW -t iotplatformcaps/owruntime_consumersensorsdisablepermissions:runtime .
docker push iotplatformcaps/owruntime_consumersensorsdisablepermissions:runtime

cd ../ConsumerConsumeGet
docker build -f DockerfileOW -t iotplatformcaps/owruntime_consumerconsumeget:runtime .
docker push iotplatformcaps/owruntime_consumerconsumeget:runtime

cd ../ConsumerConsumeUpdate
docker build -f DockerfileOW -t iotplatformcaps/owruntime_consumerconsumeupdate:runtime .
docker push iotplatformcaps/owruntime_consumerconsumeupdate:runtime

cd ../ConsumerConsumeAdd
docker build -f DockerfileOW -t iotplatformcaps/owruntime_consumerconsumeadd:runtime .
docker push iotplatformcaps/owruntime_consumerconsumeadd:runtime

cd ../ConsumerConsumeDelete
docker build -f DockerfileOW -t iotplatformcaps/owruntime_consumerconsumedelete:runtime .
docker push iotplatformcaps/owruntime_consumerconsumedelete:runtime

cd ../PredictionsGetAll
docker build -f DockerfileOW -t iotplatformcaps/owruntime_predictionsgetall:runtime .
docker push iotplatformcaps/owruntime_predictionsgetall:runtime

cd ../PredictedSensorAdd
docker build -f DockerfileOW -t iotplatformcaps/owruntime_predictedsensoradd:runtime .
docker push iotplatformcaps/owruntime_predictedsensoradd:runtime

cd ../InitializeMySql
docker build -f DockerfileOW -t iotplatformcaps/owruntime_initmysql:runtime .
docker push iotplatformcaps/owruntime_initmysql:runtime

cd ../InitializeKafka
docker build -f DockerfileOW -t iotplatformcaps/owruntime_initkafka:runtime  .
docker push iotplatformcaps/owruntime_initkafka:runtime

cd ../InitializeConnect
docker build -f DockerfileOW -t iotplatformcaps/owruntime_initconnect:runtime  .
docker push iotplatformcaps/owruntime_initconnect:runtime

cd ../SensorAdd
docker build -f DockerfileOW -t iotplatformcaps/owruntime_sensoradd:runtime .
docker push iotplatformcaps/owruntime_sensoradd:runtime

cd ../KafkaMessage
docker build -f DockerfileOW -t iotplatformcaps/owruntime_kafkamessage:runtime .
docker push iotplatformcaps/owruntime_kafkamessage:runtime


