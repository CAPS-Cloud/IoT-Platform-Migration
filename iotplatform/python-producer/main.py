import asyncio
import websockets
import time
import random
import json
import sys

TEST_TOKEN = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJpb3RwYXRmb3JtIiwic3ViIjoiMTIzNDUiLCJuYmYiOjE1MzExMzA5MjEsImV4cCI6MTU2MjY2NjkyMSwiaWF0IjoxNTMxMTMwOTIxLCJqdGkiOiJpZDEyMzQ1NiIsInR5cCI6Imh0dHBzOi8vaW90cGxhdGZvcm0uY29tIn0.EQH82SUHBtcdXGkcHqEXmxL2tkpozSsk9l1WFRBRmRLC903CMixY8CMUzGQ0biSZ4BgEHhAZsUdVeRibjqlWaGU10jkLW5OhjmbWpVewsoKcelobjgaRzFhec9HRy2NRK1ZpAoj2t7Ph7KiH9icLo0LctGPo5lbn3nhQXvNn27toIcYj3AFWswBXN6eSxSjHpN6QpwjXd2Ld_YPqGYU854g63487tsf-7PSfj7JcIhW9FN6qmetFPNERJ2JhCC52fBL9n2wp7jThsShWi3_8i-PwYyaDFD_9twntymoXbFSOsh2R__62wPX08WeXNIVMoapEB8tAHUjayI6CSPljdGd4413oyx0KsW48Ng52iMMScB8tbZPNqDdMlpHcd9Rs4zGvNSrNJ7BbvCfcn8eVyndUX9AYImRI5ZdXiraHx5yO5oPOHtM_6_0xFOKdbWEhbL6a-MhGoRk8fflc29usQtaFqJOSKZP0d_vH49ZgeP36bqI6F0-a8n9MkAJWjGRtSPmknkh7szhObZWbHDzk7xd4-63YXctdJKYdWlZT9YAvoOM0PAMeubnNxzaMtKKfciVt3SlZmUFynDVxBFeEinJ7nzchjwwqdimwgTIwIeNffWvvqH3Vo65odS6vsf8C5pGLEaW7hnuaOobyGqp4vEZ96iMchWm3X0_7xmjtCfM"

def main():
    WS_GATEWAY = sys.argv[1]
    async def hello(uri):
        async with websockets.connect(uri, extra_headers={"Authorization": "Bearer " + TEST_TOKEN}) as websocket:
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
