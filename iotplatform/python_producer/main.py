import asyncio
import websockets
import time
import random
import json

def main():
    async def hello(uri):
        async with websockets.connect(uri) as websocket:
            while True:
                await websocket.send(json.dumps(generate_msg()))
                await asyncio.sleep(1)

    asyncio.get_event_loop().run_until_complete(
        hello('ws://iotbridge:8765'))

def generate_msg():
    msg = {
        "sensorGroup" : "pythonGroup",
        "sensorId" : "fakeWeather",
        "timestamp" : time.time(),
        "reading" : str(random.randint(0,100))
    }
    return msg

if __name__ == "__main__":
    main()
