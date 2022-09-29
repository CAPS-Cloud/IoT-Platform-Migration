cd AuthenticationApp
gcloud builds submit --tag gcr.io/k3srootkessmasterserver/gcr_authentication

cd ../UserControllerSignin
gcloud builds submit --tag gcr.io/k3srootkessmasterserver/gcr_usersignin

cd ../UserControllerGetall
gcloud builds submit --tag gcr.io/k3srootkessmasterserver/gcr_usergetall

cd ../UserControllerAdd
gcloud builds submit --tag gcr.io/k3srootkessmasterserver/gcr_useradd

cd ../UserControllerUpdate
gcloud builds submit --tag gcr.io/k3srootkessmasterserver/gcr_userupdate

cd ../UserControllerDelete
gcloud builds submit --tag gcr.io/k3srootkessmasterserver/gcr_userdelete

cd ../UserControllerSelf
gcloud builds submit --tag gcr.io/k3srootkessmasterserver/gcr_userself

cd ../DeviceControllerGetAll
gcloud builds submit --tag gcr.io/k3srootkessmasterserver/gcr_devicegetall

cd ../DeviceControllerAdd
gcloud builds submit --tag gcr.io/k3srootkessmasterserver/gcr_deviceadd

cd ../DeviceControllerUpdate
gcloud builds submit --tag gcr.io/k3srootkessmasterserver/gcr_deviceupdate

cd ../DeviceControllerKey
gcloud builds submit --tag gcr.io/k3srootkessmasterserver/gcr_devicekey

cd ../DeviceControllerDelete
gcloud builds submit --tag gcr.io/k3srootkessmasterserver/gcr_devicedelete

cd ../ConsumerControllerGetAll
gcloud builds submit --tag gcr.io/k3srootkessmasterserver/gcr_consumergetall

cd ../ConsumerControllerAdd
gcloud builds submit --tag gcr.io/k3srootkessmasterserver/gcr_consumeradd

cd ../ConsumerControllerUpdate
gcloud builds submit --tag gcr.io/k3srootkessmasterserver/gcr_consumerupdate

cd ../ConsumerControllerKey
gcloud builds submit --tag gcr.io/k3srootkessmasterserver/gcr_consumerkey

cd ../ConsumerControllerDelete
gcloud builds submit --tag gcr.io/k3srootkessmasterserver/gcr_consumerdelete

cd ../SensorGetAll
gcloud builds submit --tag gcr.io/k3srootkessmasterserver/gcr_sensorgetall

cd ../SensorUpdate
gcloud builds submit --tag gcr.io/k3srootkessmasterserver/gcr_sensorupdate

cd ../SensorAdd
gcloud builds submit --tag gcr.io/k3srootkessmasterserver/gcr_sensoradd

cd ../SensorDelete
gcloud builds submit --tag gcr.io/k3srootkessmasterserver/gcr_sensordelete

cd ../ConsumersSensorsEnablePermissions
gcloud builds submit --tag gcr.io/k3srootkessmasterserver/gcr_consumersensorenablepermission

cd ../ConsumersSensorsDisablePermissions
gcloud builds submit --tag gcr.io/k3srootkessmasterserver/gcr_consumersensordisablepermission

cd ../ConsumerConsumeGet
gcloud builds submit --tag gcr.io/k3srootkessmasterserver/gcr_consumerconsumeget

cd ../ConsumerConsumeAdd
gcloud builds submit --tag gcr.io/k3srootkessmasterserver/gcr_consumerconsumeadd

cd ../ConsumerConsumeUpdate
gcloud builds submit --tag gcr.io/k3srootkessmasterserver/gcr_consumerconsumeupdate

cd ../ConsumerConsumeDelete
gcloud builds submit --tag gcr.io/k3srootkessmasterserver/gcr_consumerconsumedelete