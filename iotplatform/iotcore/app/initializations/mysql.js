const sequelize = require('../connections/mysql');

async function syncDataModels() {

   await sequelize.drop();
   await sequelize.sync({ force: true });
}

syncDataModels();