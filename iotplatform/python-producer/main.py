import asyncio
import websockets
import time
import random
import json
import sys

def main():
    WS_GATEWAY = sys.argv[1]
    async def hello(uri):
        async with websockets.connect(uri) as websocket:
            while True:
                await websocket.send(json.dumps(generate_msg()))
                await asyncio.sleep(1)

    asyncio.get_event_loop().run_until_complete(
        hello('ws://' + WS_GATEWAY))

def generate_msg():
    msg = {
        "sensor_id" : 192837466,
        "timestamp" : int(round(time.time() * 1000)),
        "value" : str(random.randint(0,100))
    }
    return msg

if __name__ == "__main__":
    main()
