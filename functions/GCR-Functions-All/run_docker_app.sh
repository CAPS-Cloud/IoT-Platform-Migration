sudo docker run -p 8070:8070 -d iotplatformcaps/gcr_authentication:runtime
sudo docker run -p 8071:8071 -d  iotplatformcaps/gcr_usergetall:runtime
sudo docker run -p 8072:8072 -d  iotplatformcaps/gcr_useradd:runtime
sudo docker run -p 8073:8073 -d  iotplatformcaps/gcr_usersignin:runtime 
sudo docker run -p 8074:8074 -d  iotplatformcaps/gcr_userdelete:runtime 
sudo docker run -p 8075:8075 -d iotplatformcaps/gcr_userself:runtime
sudo docker run -p 8076:8076 -d iotplatformcaps/gcr_userupdate:runtime