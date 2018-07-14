const fs = require('fs');

module.exports = {
    // Dashboard Secrets
    AUTHENTICATION_SECRET: '//TODO Generate high entropy secret',
    ROOT_USERNAME: 'root',
    ROOT_PASSWORD: 'x5KATOHT9zHczR49aPy0',

    // Device Secrets
    DEVICE_SECRET: fs.readFileSync('.keys/jwtRS256.key'),
    CONSUMER_SECRET: fs.readFileSync('.keys/consumer_jwtRS256.key'),
}
