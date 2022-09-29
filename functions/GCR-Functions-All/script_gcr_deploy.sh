
#Authentication
gcloud run deploy authentication --image gcr.io/k3srootkessmasterserver/gcr_authentication  --region=europe-west1  --allow-unauthenticated --concurrency=100 --cpu=1 --max-instances=100 --memory=256 --platform managed --port=8070

#Users
gcloud run deploy usergetall --image gcr.io/k3srootkessmasterserver/gcr_usergetall --allow-unauthenticated --region=europe-west1 --concurrency=100 --cpu=1 --max-instances=100 --memory=256 --platform managed --port=8071
gcloud run deploy useradd --image gcr.io/k3srootkessmasterserver/gcr_useradd --allow-unauthenticated --region=europe-west1 --concurrency=100 --cpu=1 --max-instances=100 --memory=256 --platform managed --port=8072
gcloud run deploy usersignin --image gcr.io/k3srootkessmasterserver/gcr_usersignin  --region=europe-west1  --allow-unauthenticated --concurrency=100 --cpu=1 --max-instances=100 --memory=256 --platform managed --port=8073
gcloud run deploy userdelete --image gcr.io/k3srootkessmasterserver/gcr_userdelete  --allow-unauthenticated  --region=europe-west1 --concurrency=100 --cpu=1 --max-instances=100 --memory=256 --platform managed --port=8074
gcloud run deploy userself --image gcr.io/k3srootkessmasterserver/gcr_userself  --allow-unauthenticated  --region=europe-west1 --concurrency=100 --cpu=1 --max-instances=100 --memory=256 --platform managed --port=8075
gcloud run deploy userupdate --image gcr.io/k3srootkessmasterserver/gcr_userupdate  --allow-unauthenticated  --region=europe-west1 --concurrency=100 --cpu=1 --max-instances=100 --memory=256 --platform managed --port=8076

#Devices
gcloud run deploy devicegetall --image gcr.io/k3srootkessmasterserver/gcr_devicegetall  --allow-unauthenticated  --region=europe-west1 --concurrency=100 --cpu=1 --max-instances=100 --memory=256 --platform managed --port=8077
gcloud run deploy deviceadd --image gcr.io/k3srootkessmasterserver/gcr_deviceadd --allow-unauthenticated  --region=europe-west1 --concurrency=100 --cpu=1 --max-instances=100 --memory=256 --platform managed --port=8078
gcloud run deploy deviceupdate --image gcr.io/k3srootkessmasterserver/gcr_deviceupdate --allow-unauthenticated  --region=europe-west1 --concurrency=100 --cpu=1 --max-instances=100 --memory=256 --platform managed --port=8090
gcloud run deploy devicekey --image gcr.io/k3srootkessmasterserver/gcr_devicekey --allow-unauthenticated  --region=europe-west1 --concurrency=100 --cpu=1 --max-instances=100 --memory=256 --platform managed --port=8091
gcloud run deploy devicedelete --image gcr.io/k3srootkessmasterserver/gcr_devicedelete --allow-unauthenticated  --region=europe-west1 --concurrency=100 --cpu=1 --max-instances=100 --memory=256 --platform managed --port=8092

#Consumers
gcloud run deploy consumergetall --image gcr.io/k3srootkessmasterserver/gcr_consumergetall --allow-unauthenticated  --region=europe-west1 --concurrency=100 --cpu=1 --max-instances=100 --memory=256 --platform managed --port=8093
gcloud run deploy consumeradd --image  gcr.io/k3srootkessmasterserver/gcr_consumeradd --allow-unauthenticated  --region=europe-west1 --concurrency=100 --cpu=1 --max-instances=100 --memory=256 --platform managed --port=8094
gcloud run deploy consumerupdate --image  gcr.io/k3srootkessmasterserver/gcr_consumerupdate --allow-unauthenticated  --region=europe-west1 --concurrency=100 --cpu=1 --max-instances=100 --memory=256 --platform managed --port=8095
gcloud run deploy consumerkey --image  gcr.io/k3srootkessmasterserver/gcr_consumerkey --allow-unauthenticated  --region=europe-west1 --concurrency=100 --cpu=1 --max-instances=100 --memory=256 --platform managed --port=8096
gcloud run deploy consumerdelete --image  gcr.io/k3srootkessmasterserver/gcr_consumerdelete --allow-unauthenticated  --region=europe-west1 --concurrency=100 --cpu=1 --max-instances=100 --memory=256 --platform managed --port=8097

#Sensors
gcloud run deploy sensorgetall --image gcr.io/k3srootkessmasterserver/gcr_sensorgetall --allow-unauthenticated  --region=europe-west1 --concurrency=100 --cpu=1 --max-instances=100 --memory=256 --platform managed --port=8098
gcloud run deploy sensorupdate --image gcr.io/k3srootkessmasterserver/gcr_sensorupdate --allow-unauthenticated  --region=europe-west1 --concurrency=100 --cpu=1 --max-instances=100 --memory=256 --platform managed --port=8099
gcloud run deploy sensoradd --image gcr.io/k3srootkessmasterserver/gcr_sensoradd --allow-unauthenticated  --region=europe-west1 --concurrency=100 --cpu=1 --max-instances=100 --memory=256 --platform managed --port=8100
gcloud run deploy sensordelete --image gcr.io/k3srootkessmasterserver/gcr_sensordelete --allow-unauthenticated  --region=europe-west1 --concurrency=100 --cpu=1 --max-instances=100 --memory=256 --platform managed --port=8101

#ConsumersSensorsModified
gcloud run deploy consumerenablepermission --image gcr.io/k3srootkessmasterserver/gcr_consumersensorenablepermission --allow-unauthenticated  --region=europe-west1 --concurrency=100 --cpu=1 --max-instances=100 --memory=256 --platform managed --port=8102
gcloud run deploy consumerdisablepermission --image gcr.io/k3srootkessmasterserver/gcr_consumersensordisablepermission --allow-unauthenticated  --region=europe-west1 --concurrency=100 --cpu=1 --max-instances=100 --memory=256 --platform managed --port=8103

#ConsumerConsume
gcloud run deploy consumerconsumeget --image gcr.io/k3srootkessmasterserver/gcr_consumerconsumeget --allow-unauthenticated  --region=europe-west1 --concurrency=100 --cpu=1 --max-instances=100 --memory=256 --platform managed --port=8104
gcloud run deploy consumerconsumeadd --image gcr.io/k3srootkessmasterserver/gcr_consumerconsumeadd --allow-unauthenticated  --region=europe-west1 --concurrency=100 --cpu=1 --max-instances=100 --memory=256 --platform managed --port=8105
gcloud run deploy consumerconsumeupdate --image gcr.io/k3srootkessmasterserver/gcr_consumerconsumeupdate --allow-unauthenticated  --region=europe-west1 --concurrency=100 --cpu=1 --max-instances=100 --memory=256 --platform managed --port=8106
gcloud run deploy consumerconsumedelete --image gcr.io/k3srootkessmasterserver/gcr_consumerconsumedelete --allow-unauthenticated  --region=europe-west1 --concurrency=100 --cpu=1 --max-instances=100 --memory=256 --platform managed --port=8107