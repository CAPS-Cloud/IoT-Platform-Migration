const fs = require('fs');

module.exports = {
    // Dashboard Secrets
    AUTHENTICATION_SECRET: fs.readFileSync('.keys/authentication_jwtRS256.key'),
    AUTHENTICATION_PUBLIC: fs.readFileSync('.keys/authentication_jwtRS256.key.pub'),
    ROOT_USERNAME: 'root',
    ROOT_PASSWORD: 'x5KATOHT9zHczR49aPy0',

    // Device Secrets
    DEVICE_SECRET: fs.readFileSync('.keys/jwtRS256.key'),
    DEVICE_PUBLIC: fs.readFileSync('.keys/jwtRS256.key.pub'),

    // Consumer Secrets
    CONSUMER_SECRET: fs.readFileSync('.keys/consumer_jwtRS256.key'),
    CONSUMER_PUBLIC: fs.readFileSync('.keys/consumer_jwtRS256.key.pub'),
}
