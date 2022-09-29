#Delete docker images
# sudo docker images | grep owruntime | awk '{system("sudo docker rmi --force "$3"")}'

#Change runtime tag from latest to runtime to prevent registry checks by ow

cd AuthenticationApp
wsk action delete authenticationapp -i
wsk action create authenticationapp app.js --docker iotplatformcaps/owruntime_authapp:runtime --memory 256 --web true -i

cd ../UserControllerGetAll
wsk action delete usergetall -i
wsk action create usergetall app.js --docker iotplatformcaps/owruntime_usercontrollergetall:runtime --memory 256 --web true -i

cd ../UserControllerSignin
wsk action delete usersignin -i
wsk action create usersignin app.js --docker iotplatformcaps/owruntime_usercontrollersignin:runtime --memory 256 --web true -i

cd ../UserControllerSelf
wsk action delete userself -i
wsk action create userself app.js --docker iotplatformcaps/owruntime_usercontrollerself:runtime --memory 256 --web true -i

cd ../UserControllerAdd
wsk action delete useradd -i
wsk action create useradd app.js --docker iotplatformcaps/owruntime_usercontrolleradd:runtime --memory 256 --web true -i

cd ../UserControllerUpdate
wsk action delete userupdate -i
wsk action create userupdate app.js --docker iotplatformcaps/owruntime_usercontrollerupdate:runtime --memory 256 --web true -i

cd ../UserControllerDelete
wsk action delete userdelete -i
wsk action create userdelete app.js --docker iotplatformcaps/owruntime_usercontrollerdelete:runtime  --memory 256 --web true -i

cd ../DeviceControllerGetAll
wsk action delete devicegetall -i
wsk action create devicegetall app.js --docker iotplatformcaps/owruntime_devicecontrollergetall:runtime --memory 256 --web true -i

cd ../DeviceControllerAdd
wsk action delete deviceadd -i
wsk action create deviceadd app.js --docker iotplatformcaps/owruntime_devicecontrolleradd:runtime --memory 256 --web true -i


cd ../DeviceControllerUpdate
wsk action delete deviceupdate -i
wsk action create deviceupdate app.js --docker iotplatformcaps/owruntime_devicecontrollerupdate:runtime --memory 256 --web true -i


cd ../DeviceControllerDelete
wsk action delete devicedelete -i
wsk action create devicedelete app.js --docker iotplatformcaps/owruntime_devicecontrollerdelete:runtime --memory 256 --web true -i


cd ../DeviceControllerKey
wsk action delete devicekey -i
wsk action create devicekey app.js --docker iotplatformcaps/owruntime_devicecontrollerkey:runtime --memory 256 --web true -i


cd ../ConsumerControllerGetAll
wsk action delete consumergetall -i
wsk action create consumergetall app.js --docker iotplatformcaps/owruntime_consumercontrollergetall:runtime --memory 256 --web true -i


cd ../ConsumerControllerAdd
wsk action delete consumeradd -i
wsk action create consumeradd app.js --docker iotplatformcaps/owruntime_consumercontrolleradd:runtime --memory 256 --web true -i


cd ../ConsumerControllerUpdate
wsk action delete consumerupdate -i
wsk action create consumerupdate app.js --docker iotplatformcaps/owruntime_consumercontrollerupdate:runtime --memory 256 --web true -i


cd ../ConsumerControllerKey
wsk action delete consumerkey -i
wsk action create consumerkey app.js --docker iotplatformcaps/owruntime_consumercontrollerkey:runtime --memory 256 --web true -i


cd ../ConsumerControllerDelete
wsk action delete consumerdelete -i
wsk action create consumerdelete app.js --docker iotplatformcaps/owruntime_consumercontrollerdelete:runtime --memory 256 --web true -i

cd ../SensorGetAll
wsk action delete sensorgetall -i
wsk action create sensorgetall app.js --docker iotplatformcaps/owruntime_sensorgetall:runtime --memory 256 --web true -i


cd ../SensorUpdate
wsk action delete sensorupdate -i
wsk action create sensorupdate app.js --docker iotplatformcaps/owruntime_sensorupdate:runtime --memory 256 --web true -i


cd ../SensorDelete
wsk action delete sensordelete -i
wsk action create sensordelete app.js --docker iotplatformcaps/owruntime_sensordelete:runtime --memory 256 --web true -i

cd ../ConsumersSensorsEnablePermissions
wsk action delete consumersensorenablepermission -i
wsk action create consumersensorenablepermission app.js --docker iotplatformcaps/owruntime_consumersensorsenablepermissions:runtime --memory 256 --web true -i


cd ../ConsumersSensorsDisablePermissions
wsk action delete consumersensordisablepermission -i
wsk action create consumersensordisablepermission app.js --docker iotplatformcaps/owruntime_consumersensorsdisablepermissions:runtime --memory 256 --web true -i

cd ../ConsumerConsumeGet
wsk action delete consumersconsumeget -i
wsk action create consumersconsumeget app.js --docker iotplatformcaps/owruntime_consumerconsumeget:runtime --memory 256 --web true -i

cd ../ConsumerConsumeUpdate
wsk action delete consumersconsumeupdate -i
wsk action create consumersconsumeupdate app.js --docker iotplatformcaps/owruntime_consumerconsumeupdate:runtime --memory 256 --web true -i

cd ../ConsumerConsumeAdd
wsk action delete consumersconsumeadd -i
wsk action create consumersconsumeadd app.js --docker iotplatformcaps/owruntime_consumerconsumeadd:runtime --memory 256 --web true -i

cd ../ConsumerConsumeDelete
wsk action delete consumersconsumedelete -i
wsk action create consumersconsumedelete app.js --docker iotplatformcaps/owruntime_consumerconsumedelete:runtime --memory 256 --web true -i


cd ../PredictionsGetAll
wsk action delete predictionsgetall -i
wsk action create predictionsgetall app.js --docker iotplatformcaps/owruntime_predictionsgetall:runtime --memory 256 --web true -i


cd ../PredictedSensorAdd
wsk action delete predictedsensoradd -i
wsk action create predictedsensoradd app.js --docker iotplatformcaps/owruntime_predictedsensoradd:runtime --memory 256 --web true -i

cd ../InitializeMySql
wsk action delete initializesql -i
wsk action create initializesql app.js --docker iotplatformcaps/owruntime_initmysql:runtime --memory 256 --web true -i

cd ../InitializeKafka
wsk action delete initializekafka -i
wsk action create initializekafka app.js --docker iotplatformcaps/owruntime_initkafka:runtime --memory 256 --web true -i

cd ../InitializeConnect
wsk action delete initializeconnect -i
wsk action create initializeconnect app.js --docker iotplatformcaps/owruntime_initconnect:runtime  --memory 256 --web true -i

cd ../SensorAdd
wsk action delete sensoradd -i
wsk action create sensoradd app.js --docker iotplatformcaps/owruntime_sensoradd:runtime --memory 256 --web true -i

cd ../KafkaMessage
wsk action delete kafkamessage -i
wsk action create kafkamessage app.js --docker iotplatformcaps/owruntime_kafkamessage:runtime --memory 256 --web true -i
