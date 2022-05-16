# USERS -SIGN-IN

# Move to function's directory
cd ./UserControllerSignin

# Build and push function's Docker image to public registry
docker build -t ge25qik/whisk-users-signin:ow -f DockerfileOW . --no-cache
docker push ge25qik/whisk-users-signin:ow  

# Create OpenWhisk Function
wsk -i action update user-signin app.js --docker ge25qik/whisk-users-signin:ow --memory 256 --web true 

# AUTHENTICATION

# Move to function's directory
cd ../AuthenticationNew

# Build and push function's Docker image to public registry
docker build -t ge25qik/whisk-auth-new:ow -f DockerfileOW . --no-cache
docker push ge25qik/whisk-auth-new:ow 

# Create OpenWhisk Function
wsk -i action update authSuperUser app.js --docker ge25qik/whisk-auth-new:ow --memory 256 --web true --param AuthLevel SUPER_USER
wsk -i action update authAdmin app.js --docker ge25qik/whisk-auth-new:ow --memory 256 --web true --param AuthLevel ADMIN
wsk -i action update authUser app.js --docker ge25qik/whisk-auth-new:ow --memory 256 --web true --param AuthLevel USER

# USERS - ADD

# Move to function's directory
cd ../UserControllerAdd

# Build and push function's Docker image to public registry
docker build -t ge25qik/whisk-users-add:ow -f DockerfileOW . --no-cache
docker push ge25qik/whisk-users-add:ow 

# Create OpenWhisk Function
wsk -i action update user-add app.js --docker ge25qik/whisk-users-add:ow --memory 256 --web true
wsk -i action update auth-user-add --sequence authAdmin,user-add --web true
wsk -i action get auth-user-add --url

# USERS - GET-ALL

# Move to function's directory
cd ../UserControllerGetAll

# Build and push function's Docker image to public registry
docker build -t ge25qik/whisk-users-getall:ow -f DockerfileOW . --no-cache
docker push ge25qik/whisk-users-getall:ow 

# Create OpenWhisk Function
wsk -i action update user-getall app.js --docker ge25qik/whisk-users-getall:ow --memory 256 --web true
wsk -i action update auth-user-getall --sequence authUser,user-getall --web true
wsk -i action get auth-user-getall --url

# DEVICES - ADD

# Move to function's directory
cd ../DeviceControllerAdd

# Build and push function's Docker image to public registry
docker build -t ge25qik/whisk-devices-add:ow -f DockerfileOW . --no-cache
docker push ge25qik/whisk-devices-add:ow 

# Create OpenWhisk Function
wsk -i action update devices-add app.js --docker ge25qik/whisk-devices-add:ow--memory 256 --web true
wsk -i action update auth-devices-add --sequence authUser,devices-add --web true
wsk -i action get auth-devices-add --url

# DEVICES - GET-ALL

# Move to function's directory
cd ../DeviceControllerGetAll

# Build and push function's Docker image to public registry
docker build -t ge25qik/whisk-devices-getall:ow -f DockerfileOW . --no-cache
docker push ge25qik/whisk-devices-getall:ow 

# Create OpenWhisk Function
wsk -i action update devices-getall app.js --docker ge25qik/whisk-devices-getall:ow --memory 256 --web true
wsk -i action update auth-devices-getall --sequence authUser,devices-getall --web true
wsk -i action get auth-devices-getall --url

# SENSORS - ADD

# Move to function's directory
cd ../SensorAdd

# Build and push function's Docker image to public registry
docker build -t ge25qik/whisk-sensors-add:ow -f DockerfileOW . --no-cache
docker push ge25qik/whisk-sensors-add:ow

# Create OpenWhisk Function
wsk -i action update sensors-add app.js --docker ge25qik/whisk-sensors-add:ow --memory 256 --web true
wsk -i action update auth-sensors-add --sequence authUser,sensors-add --web true
wsk -i action get auth-sensors-add --url

# SENSORS - GET-ALL

# Move to function's directory
cd ../SensorGetAll

# Build and push function's Docker image to public registry
docker build -t ge25qik/whisk-sensors-getall:ow -f DockerfileOW . --no-cache
docker push ge25qik/whisk-sensors-getall:ow 

# Create OpenWhisk Function
wsk -i action update sensors-getall app.js --docker ge25qik/whisk-sensors-getall:ow --memory 256 --web true
wsk -i action update auth-sensors-getall --sequence authUser,sensors-getall --web true
wsk -i action get auth-sensors-getall --url

# HTTP-GATEWAY

# Move to function's directory
cd ../HttpGateway

# Build and push function's Docker image to public registry
docker build -t ge25qik/whisk-http-gateway:ow -f DockerfileOW . --no-cache
docker push ge25qik/whisk-http-gateway:ow 

# Create OpenWhisk Function
wsk -i action update httpGateway app.js --docker ge25qik/whisk-http-gateway:ow --memory 256 --web true
wsk -i action get httpGateway --url

# CONSUMER - Consume - GET

# Move to function's directory
cd ../ConsumerConsumeGet

# Build and push function's Docker image to public registry
docker build -t ge25qik/whisk-consumers-consume-getall:ow -f DockerfileOW . --no-cache
docker push ge25qik/whisk-consumers-consume-getall:ow

# Create OpenWhisk Function
wsk -i action update consume-get app.js --docker ge25qik/whisk-consumers-consume-getall:ow --memory 256 --web true
wsk -i action get consume-get --url