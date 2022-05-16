const args = process.argv;
const MARIADB = args[2];
process.env.MARIADB = MARIADB;

require('./initializations')
const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const routes = require('./routes');

const http = require("http"),
    fs = require("fs");

// const options = {
//     key: fs.readFileSync("/data/privkey.pem"),
//     cert: fs.readFileSync("/data/certificate.pem")
// };

const port = process.env.PORT || 3000;

const app = express();
console.disableYellowBox = true;
app.use(express.static('public'));

app.use(cors());
app.use(bodyParser.json());
app.use('/', routes);

app.get('*', function (request, response) {
  response.sendFile(path.resolve(__dirname, 'public', 'index.html'))
});

if (require.main === module) {
  //app.listen(port);
  http.createServer(app).listen(port, function () {
    console.log(`Server is listening on port ${port}`)
  })
}

module.exports = app
