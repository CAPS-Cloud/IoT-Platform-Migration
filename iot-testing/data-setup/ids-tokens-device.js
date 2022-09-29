const axios = require("axios").default;
const fs = require("fs");

const IOT_CORE = "http://34.107.39.209:3000";
const ROOT_USERNAME = "root";
const ROOT_PASSWORD = "x5KATOHT9zHczR49aPy0";

const run = async () => {
  try {
    console.time("Timer");
    const signinRes = await axios.post(IOT_CORE + "/api/users/signin", {
      username: ROOT_USERNAME,
      password: ROOT_PASSWORD,
    });

    const token = signinRes.data?.token;

    const getUsers = await axios.get(IOT_CORE + "/api/users/", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    let ids = [];
    for (user of getUsers.data?.result) {
      const userSigninRes = await axios.post(
        IOT_CORE + "/api/users/signin",
        {
          username: user.username,
          password: user.username,
        },
        { timeout: 60000 }
      );

      for (device of user.devices) {
        const id = {
          id: user.id,
          username: user.username,
        };
        id.token = userSigninRes.data?.token;
        id.deviceId = device.id;
        ids.push(id);
      }
    }

    ids.sort((a, b) => a.username.localeCompare(b.username));

    fs.writeFile(
      "./outputs/tokens-device.js",
      JSON.stringify(ids),
      function (err) {
        if (err) return console.log(err);
        console.log(ids.length + " devices written to tokens-device.js!");
      }
    );

    console.timeEnd("Timer");
  } catch (error) {
    console.error(error);
  }
};

run();
