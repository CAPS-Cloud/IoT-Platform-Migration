const args = process.argv;
const MARIADB = args[2];
process.env.MARIADB = MARIADB;

require('./initializations')
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const routes = require('./routes');
const AuthenticationCheckHandler = require('./handlers/AuthenticationCheckHandler');

const port = process.env.PORT || 3000;

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use('/', AuthenticationCheckHandler, routes);

if (require.main === module) {
    app.listen(port);
    console.log(`Server is listening on port ${port}`);
}

module.exports = app;