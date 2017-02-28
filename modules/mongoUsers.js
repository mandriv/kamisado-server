var mongoose = require("mongoose");
var jwt = require('jsonwebtoken');
var secret = "WojciechCichoradzki";
mongoose.Promise = global.Promise;
var usersConn = mongoose.createConnection('mongodb://localhost:27017/usersDB');

// create schema
var userSchema = mongoose.Schema({
    nickname: {
        type: String,
        required: true,
        index: {
            unique: true
        }
    },
    email: {
        type: String,
        required: true,
        index: {
            unique: true
        }
    },
    password: {
        type: String,
        required: true
    },
    dateJoined: {
        type: Date,
        default: Date.now
    },
    gamesPlayerd: {
        type: Number,
        default: 0
    },
    gamesWon: {
        type: Number,
        default: 0
    },
    admin: {
        type: Boolean,
        default: false
    }
});

var exports = module.exports = {};

var User = usersConn.model('User', userSchema);

exports.authenticateUser = function(req, res) {
    var response = {};
    // find the user by e-mail
    User.findOne({
        email: req.body.email
    }, function(err, user) {
        if (err) {
            response = {
                "error": true,
                "message": JSON.stringify(err)
            };
        } else {
            var inputPassword = require('crypto')
                .createHash('sha1')
                .update(req.body.password)
                .digest('base64');
            if (user.password != inputPassword) {
                response = {
                    "error": true,
                    "message": "Authentication failed. Wrong password"
                };
            } else {
                var payload = { userID: user._id.valueOf(),
                nickname: user.nickname}
                var token = jwt.sign(payload, secret, {
                    expiresIn: 60 * 60 * 24 // expires in 24 hours
                });
                response = {
                    "error": false,
                    "message": "Token acquired!",
                    "token": token
                };
            }
        }
        res.json(response);
    });
}

exports.verifyToken = function(req, res, next) {

    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['token'];

    // decode token
    if (token) {

        // verifies secret and checks exp
        jwt.verify(token, secret, function(err, decoded) {
            if (err) {
                return res.json({
                    "error": false,
                    "message": 'Failed to authenticate token.'
                });
            } else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                next();
            }
        });

    } else {

        // if there is no token
        // return an error
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });

    }
}

exports.clearDatabase = function() {
    User.remove({}, function(err) {
        console.log('collection removed')
    });
}

//GET /users
exports.getUsers = function(req, res) {
    var response = {};
    User.find({}, function(err, data) {
        // Mongo command to fetch all data from collection.
        if (err) {
            response = {
                "error": true,
                "message": "Error fetching data"
            };
        } else {
            response = {
                "error": false,
                "message": data,
            };
        }
        res.json(response);
    });
}
//POST /users
exports.postUsers = function(req, res) {
    var newUser = new User();
    var response = {};
    newUser.nickname = req.body.nickname;
    //add validation
    newUser.email = req.body.email;
    //SHA1 algorithm - see shattered.io
    newUser.password = require('crypto')
        .createHash('sha1')
        .update(req.body.password)
        .digest('base64');

    newUser.save(function(err) {
        if (err) {
            response = {
                "error": true,
                "message": err.errmsg
            };
        } else {
            response = {
                "error": false,
                "message": "User " + newUser.nickname + " added to database!"
            };
        }
        res.json(response);
    });
}

exports.getUserByID = function(req, res) {
    var response = {};
    User.findById(req.params.id, function(err, data) {
        // This will run Mongo Query to fetch data based on ID.
        if (err) {
            response = {
                "error": true,
                "message": "Error fetching data"
            };
        } else {
            response = {
                "error": false,
                "message": data
            };
        }
        res.json(response);
    });
}
var gameSchema = mongoose.Schema({
    name: {
      type: String,
      required: true
    },
    player1: {
      type: String,
      required: true
    },
    player1_ID: {
      type: String,
      required: true
    },
    player2: {
        type: String,
        default: ""
    },
    player2_ID: {
      type: String,
      default: ""
    },
    inLobby: {
        type: Boolean,
        default: true
    },
    finished: {
        type: Boolean,
        default: false
    },
    P1score: {
        type: Number,
        default: 0
    },
    P2score: {
        type: Number,
        default: 0
    },
    time: {
        type: Number,
        default: 0
    }
});
exports.putUserByID = function(req, res) {
    var response = {};
    // first find out record exists or not
    // if it does then update the record
    User.findById(req.params.id, function(err, data) {
        if (err) {
            response = {
                "error": true,
                "message": "Error fetching data"
            };
        } else {
            // we got data from Mongo.
            // change it accordingly.
            if (req.body.email !== undefined) {
                // case where email needs to be updated.
                data.email = req.body.email;
            }
            if (req.body.password !== undefined) {
                // case where password needs to be updated
                data.password = req.body.password;
            }
            if (req.body.nickname !== undefined) {
                // case where nickname needs to be updated
                data.nickname = req.body.nickname;
            }
            // save the data
            data.save(function(err) {
                if (err) {
                    response = {
                        "error": true,
                        "message": "Error updating data"
                    };
                } else {
                    response = {
                        "error": false,
                        "message": "Data is updated for " + req.params.id
                    };
                }
                res.json(response);
            })
        }
    });
}

exports.deleteUserById = function(req, res) {
    var response = {};
    // find the data
    User.findById(req.params.id, function(err, data) {
        if (err) {
            response = {
                "error": true,
                "message": "Error fetching data"
            };
        } else {
            // data exists, remove it.
            User.remove({
                _id: req.params.id
            }, function(err) {
                if (err) {
                    response = {
                        "error": true,
                        "message": "Error deleting data"
                    };
                } else {
                    response = {
                        "error": true,
                        "message": "Data associated with " + req.params.id + "is deleted"
                    };
                }
                res.json(response);
            });
        }
    });
};