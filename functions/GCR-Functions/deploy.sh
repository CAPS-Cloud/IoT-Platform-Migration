cd ./UserControllerSignin
gcloud builds submit --tag eu.gcr.io/devops-v-noops/user-signin
gcloud run deploy usersignin \
	--image eu.gcr.io/devops-v-noops/user-signin:latest \
	--region=europe-west3 --allow-unauthenticated --concurrency=100 \
	--cpu=1 --max-instances=20 --memory=256Mi --platform managed \
	--port=8073 --vpc-connector=iot-connector

cd ../UserControllerGetAll
gcloud builds submit --tag eu.gcr.io/devops-v-noops/user-getall
gcloud run deploy user-getall \
	--image eu.gcr.io/devops-v-noops/user-getall:latest \
	--region=europe-west3 --allow-unauthenticated --concurrency=100 \
	--cpu=1 --max-instances=20 --memory=256Mi --platform managed \
	--port=8071 --vpc-connector=iot-connector

cd ../UserControllerAdd
gcloud builds submit --tag eu.gcr.io/devops-v-noops/user-add  
gcloud run deploy user-add \
	--image eu.gcr.io/devops-v-noops/user-add:latest \
	--region=europe-west3 --allow-unauthenticated --concurrency=100 \
	--cpu=1 --max-instances=20 --memory=256Mi --platform managed \
	--port=8072 --vpc-connector=iot-connector

cd ../DevicesControllerGetAll
gcloud builds submit --tag eu.gcr.io/devops-v-noops/device-getall  
gcloud run deploy device-getall \
	--image eu.gcr.io/devops-v-noops/device-getall:latest \
	--region=europe-west3 --allow-unauthenticated --concurrency=100 \
	--cpu=1 --max-instances=20 --memory=256Mi --platform managed \
	--port=8077 --vpc-connector=iot-connector

cd ../DevicesControllerAdd
gcloud builds submit --tag eu.gcr.io/devops-v-noops/device-add  
gcloud run deploy device-add \
	--image eu.gcr.io/devops-v-noops/device-add:latest \
	--region=europe-west3 --allow-unauthenticated --concurrency=100 \
	--cpu=1 --max-instances=20 --memory=256Mi --platform managed \
	--port=8078 --vpc-connector=iot-connector

cd ../SensorsGetAll
gcloud builds submit --tag eu.gcr.io/devops-v-noops/sensor-getall  
gcloud run deploy sensor-getall \
	--image eu.gcr.io/devops-v-noops/sensor-getall:latest \
	--region=europe-west3 --allow-unauthenticated --concurrency=100 \
	--cpu=1 --max-instances=20 --memory=256Mi --platform managed \
	--port=8098 --vpc-connector=iot-connector

cd ../SensorsAdd
gcloud builds submit --tag eu.gcr.io/devops-v-noops/sensor-add  
gcloud run deploy sensor-add \
	--image eu.gcr.io/devops-v-noops/sensor-add:latest \
	--region=europe-west3 --allow-unauthenticated --concurrency=100 \
	--cpu=1 --max-instances=20 --memory=256Mi --platform managed \
	--port=8100 --vpc-connector=iot-connector

cd ../HttpGateway
gcloud builds submit --tag eu.gcr.io/devops-v-noops/http-gateway 
gcloud run deploy http-gateway  \
	--image eu.gcr.io/devops-v-noops/http-gateway:latest \
	--region=europe-west3 --allow-unauthenticated --concurrency=100 \
	--cpu=1 --max-instances=20 --memory=256Mi --platform managed \
	--port=8080 --vpc-connector=iot-connector

cd ../ConsumerConsumeGet
gcloud builds submit --tag eu.gcr.io/devops-v-noops/consumer-get
gcloud run deploy consumer-get  \
	--image eu.gcr.io/devops-v-noops/consumer-get:latest \
	--region=europe-west3 --allow-unauthenticated --concurrency=100 \
	--cpu=1 --max-instances=20 --memory=256Mi --platform managed \
	--port=8104 --vpc-connector=iot-connector