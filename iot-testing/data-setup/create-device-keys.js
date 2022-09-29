const axios = require("axios").default;
const fs = require("fs");
const tokensDevice = require("./outputs/tokens-device-fix.js").tokensDevice;

const IOT_CORE = "http://35.234.85.255:3000";
const ROOT_USERNAME = "root";
const ROOT_PASSWORD = "x5KATOHT9zHczR49aPy0";

const run = async () => {
  try {
    console.time("Timer");

    for (const item of tokensDevice) {
      const keyRes = await axios.get(
        IOT_CORE +
          "/api/users/" +
          item.id +
          "/devices/" +
          item.deviceId +
          "/key",
        {
          headers: {
            Authorization: `Bearer ${item.token}`,
          },
        }
      );
      item.key = keyRes.data?.token;

      const sensorRes = await axios.get(
        IOT_CORE +
          "/api/users/" +
          item.id +
          "/devices/" +
          item.deviceId +
          "/sensors",
        {
          headers: {
            Authorization: `Bearer ${item.token}`,
          },
        }
      );
      let minSensorId = Math.min.apply(
        Math,
        sensorRes.data?.result.map((sensor) => sensor.id)
      );
      item.sensorId = minSensorId;
    }

    fs.writeFile(
      "./outputs/device-keys-raw.js",
      JSON.stringify(tokensDevice),
      function (err) {
        if (err) return console.log(err);
        console.log("Wrote to device-keys-raw.js!");
      }
    );
    console.timeEnd("Timer");
  } catch (error) {
    console.error(error);
  }
};

run();
