const Sequelize = require("sequelize");
const sequelize = require("../connections/mysql");
const Sensors = require("../models/SensorsModel");
const Alerts = require("../models/AlertsModel");

const Devices = sequelize.define("devices", {
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  description: {
    type: Sequelize.STRING,
    defaultValue: "",
  },
  clientId: {
    type: Sequelize.STRING,
    defaultValue: "",
  },
  username: {
    type: Sequelize.STRING,
    defaultValue: "",
  },
  password: {
    type: Sequelize.STRING,
    defaultValue: "",
  },
  url: {
    type: Sequelize.STRING,
    defaultValue: "",
  },
  ttn_topic_to_subscribe: {
    type: Sequelize.STRING,
    defaultValue: "",
  },
});
Devices.hasMany(Sensors, { onDelete: "cascade" });
Sensors.belongsTo(Devices, { onDelete: "cascade" });

module.exports = Devices;
