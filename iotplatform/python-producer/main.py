import asyncio
import websockets
import time
import random
import json
import sys

TEST_TOKEN = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJpb3RwbGF0Zm9ybSIsInN1YiI6IjEyMzQ1IiwibmJmIjoxNTMxMTMyODA4LCJleHAiOjE1NjI2Njg4MDgsImlhdCI6MTUzMTEzMjgwOCwianRpIjoiaWQxMjM0NTYiLCJ0eXAiOiJodHRwczovL2lvdHBsYXRmb3JtLmNvbSJ9.dZoOJcfI2bd32FJtQoTtMt7AxlklFFbzmPdJQ3Q08JSvn82y4eje1MGFOQDa76HfyOUuvhxiw6kzxpH2i5bSP-KrJ-TsXfrlgY0YxX2SqNFVm7ArzYtH3auHpht8q3ZfNch3RbnDHDv2VyUNFeoYOWjBtveGQgk5I9Ox_bbYZ5EuBakTlahuv_PG3OSkq59626Usvzqo77XyWYPuHcsxTa-m3DBSBHufF95sbtDemjxQP5NhYkE_OM6ZZmRItxHEJqBVDEG9JI64ECnwi6XNcq3nk_CzJNXbEnivN42vIPzdodzDECsJr2say9hOJhvpAQMCdh3SYwN063rPMjf9aMIXYmilxh0y0uCo8w2E8RxoRw51gbDlDZiq3D1LXlAL2h6-3Zm21_ip1kKSzaT6DdYsjssns1ofl6xRY5bVZbEi9oNO7WxgWVCnSHQ2Xim8TsXCPvAczsiLehHCW-ZC6xHvU7yZ0n6QLC3Oo4VTA7gAR9R1B4tIpwKcuc6fo0hqZ24lUwtpcnahmC6CBv-WPQ07pED677PguqEk_NVXL6LAZHFcI9fFeQX7ubWAXwjGyv7xKnA88453k6ylczb6KuHGvc9FY351CRiBXDxu0wnl9j9lAJaTs7Mb-52A5UuANUhbaXgAD1uMhIA3xtJJ3wL_yq8LTurSHVOEAS9xFl8"

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
        "sensor_id" : "192837466",
        "timestamp" : int(round(time.time() * 1000)),
        "value" : str(random.randint(0,100))
    }
    return msg

if __name__ == "__main__":
    main()
