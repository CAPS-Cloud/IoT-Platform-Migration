const axios = require("axios").default;

const IOT_CORE = "http://34.89.243.77:3000";
const ROOT_USERNAME = "root";
const ROOT_PASSWORD = "x5KATOHT9zHczR49aPy0";

const run = async () => {
  try {
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
    const ids = getUsers.data?.result?.map((user) => user.id);

    for (const id of ids) {
      try {
        postUser = await axios.delete(IOT_CORE + "/api/users/" + id, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (error) {
        console.error(error);
      }
    }
  } catch (error) {
    console.error(error);
  }
};

run();
