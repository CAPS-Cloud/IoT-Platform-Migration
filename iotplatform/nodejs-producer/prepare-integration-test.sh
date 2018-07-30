#!/bin/bash
set -e

sleep 10

# Login to retrieve initial token
get_initial_token() {
    curl \
            -X POST \
            -H "Content-Type: application/json" \
            -d '{"username":"root","password":"x5KATOHT9zHczR49aPy0"}' \
            ${IOTCORE_BACKEND}/api/users/signin \
        > jwt.json

    export JWT=$(cat jwt.json \
        | jq -r '.token'
    )
}

# Create device by issueing POST request to IoTCore backend
create_device() {
    curl \
            -X POST \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer "${JWT} \
            -d '{"name":"'${NAME}'","description":"'${NAME}'-integration-test-device"}' \
            ${IOTCORE_BACKEND}/api/devices/ \
        > device.json

    export DEVICE_ID=$(cat device.json \
        | jq -r '.result.id'
    )
}

# Create sensor by issueing POST request to IoTCore backend
create_sensor() {
    curl \
            -X POST \
            -H "Content-Type: application/json" \
            -H "Authorization: Bearer "${JWT} \
            -d '{"name":"'${NAME}'","description":"'${NAME}'-integration-test-sensor","mapping":"{\"type\":\"double\"}"}' \
            ${IOTCORE_BACKEND}/api/devices/${DEVICE_ID}/sensors/ \
        > sensor.json

    export SENSOR_ID=$(cat sensor.json \
        | jq -r '.id'
    )
}

# Retrieve auth key for device from IoTCore backend
retrieve_auth_key() {
    curl \
            -X GET \
            -H "Authorization: Bearer "${JWT} \
            ${IOTCORE_BACKEND}/api/devices/${DEVICE_ID}/key \
        > token.json

    export TOKEN=$(cat token.json \
        | jq -r '.token'
    )
}


################################################################################
################################################################################
################################################################################

get_initial_token
create_device
create_sensor
retrieve_auth_key
