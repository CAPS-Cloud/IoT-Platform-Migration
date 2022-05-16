const axios = require('axios')
const { stringify } = require('flatted')
const https = require('https');

const ConsumerConsumeGet = function (req, res) {
  const nparams = {
    req: stringify(req)
  }

  const agent = new https.Agent({
    rejectUnauthorized: false
  });

  axios
    .post('https://23bc46b1-71f6-4ed5-8c54-816aa4f8c502:123zO3xZCLrMN6v2BKK1dXYFpXlPkccOFqm12CdAsMgRU4VrNZ9lyGVCGuMDGIwP@10.195.5.180:31001/api/v1/web/guest/default/consumersconsumeget?blocking=true&result=true', 
      nparams,
      {httpsAgent: agent })
    .then((response) => {
      res.status(200).json(response.data)
      //   return next()
    })
    .catch((error) => {
      console.log(error)
      res.status(401).send('Error in sending request')
    })
}

exports.ConsumerConsumeGet = ConsumerConsumeGet
