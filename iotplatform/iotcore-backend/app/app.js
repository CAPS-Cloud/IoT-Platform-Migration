const express = require('express');
const jwt = require('jsonwebtoken');
const addDocument = require('./add-document');

const app = express();

app.post('/users',(req,res) => {
    var toAdd = {
        name: "User Last",
        username: "user3",
        password: "123",
        role: "Admin"
    };

    addDocument.add(toAdd, function(result, err) {
        if(err) {
            res.json(err);
        } else {
            res.json(result);
        }
    });
});

app.get('/api',(req,res) => {
    res.json({
        message: 'successful!'
    });
});

app.post('/api/login', (req,res) => {
    //Mock user
    const user = {
        id:143,
        username:'bahar'
    }
    jwt.sign({user},'secretKey', (err, token) => {
        res.json({
            token
        });
    });
})

app.post('/api/posts', verifyToken, (req,res) => {
    jwt.verify(req.token, 'secretKey',(err, authData) => {
        if (err) {
            res.sendStatus(403);
        } else {
            res.json({
                message: 'post service',
                authData
            });
        }
    })

});

function verifyToken(req, res, next){
    // Authorization: Bearer <access_token>
    const bearerHeader = req.headers['authorization'];
    if (typeof bearerHeader !== 'undefined') {
        // Split the space
        const bearer = bearerHeader.split(' ');
        const bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    } else {
        // Forbidden
        res.sendStatus(403);
    }
}

app.listen(5000, () => console.log('server started on port 5000')); 