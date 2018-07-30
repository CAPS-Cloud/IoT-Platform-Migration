import asyncio
import websockets
import time
import random
import json
import sys

def main():
    WS_GATEWAY = sys.argv[1]
    IOTCORE_BACKEND = sys.argv[2]
    DEVICE_ID = sys.argv[3]
    SENSOR_ID = sys.argv[4]
    TOKEN = sys.argv[5]


    async def hello(uri):
        async with websockets.connect(uri, extra_headers={"authorization": "Bearer " + TOKEN}) as websocket:
            while True:
                await websocket.send(json.dumps(generate_msg()))
                await asyncio.sleep(1)

    asyncio.sleep(5)
    asyncio.get_event_loop().run_until_complete(
        hello('ws://' + WS_GATEWAY))

def generate_msg():
    SENSOR_ID = sys.argv[4]

    msg = {
        "sensor_id" : "" + SENSOR_ID,
        "timestamp" : int(round(time.time() * 1000000)),
        "value" : str(random.randint(0,100))
    }
    return msg

if __name__ == "__main__":
    main()
