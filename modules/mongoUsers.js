var mongoose = require("mongoose");
var random = require("./randomPassword.js");
var mail = require("./emailSender.js");
var jwt = require('jsonwebtoken');
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGO_URI, function(err, db) {
    if (err) {
        console.log('Unable to connect to the database. Error: ', err);
    } else {
        console.log('Connected to database successfully...');
    }
});

// create schema
var userSchema = mongoose.Schema({
    name: {
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
    gamesPlayed: {
        type: Number,
        default: 0
    },
    gamesWon: {
        type: Number,
        default: 0
    },
    eloRating: {
        type: Number,
        default: 1000
    },
    avatar: {
        type: String,
        default: "1"
    },
    admin: {
        type: Boolean,
        default: false
    }
});

var exports = module.exports = {};

var User = mongoose.model('User', userSchema);

exports.authenticateUser = function(req, res) {
    var response = {};
    if (req.body.name == null || req.body.password == null) {
        response = {
            "error": true,
            "message": "password/username is null"
        }
        res.json(response);
    }
    User.findOne({
        name: req.body.name
    }, function(err, user) {
        if (err) {
            response = {
                "error": true,
                "message": err.errmsg
            };
        } else {
            if (user == null) {
                response = {
                    "error": true,
                    "message": "User not found"
                };
            } else {
                var inputPassword = require('crypto')
                    .createHash('sha1')
                    .update(req.body.password)
                    .digest('base64');
                if (user.password != inputPassword) {
                    response = {
                        "error": true,
                        "message": "Wrong password"
                    };
                } else {
                    var payload = {
                        userID: user._id.valueOf(),
                        name: user.name
                    }
                    var token = jwt.sign(payload, process.env.SECRET_KEY, {
                        expiresIn: 60 * 60 * 24 // expires in 24 hours
                    });
                    response = {
                        "error": false,
                        "message": "Authenticated",
                        "token": token,
                        "userID": user._id
                    };
                }
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
        jwt.verify(token, process.env.SECRET_KEY, function(err, decoded) {
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
            error: true,
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

function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

//POST /users
exports.postUsers = function(req, res) {
    var newUser = new User();
    var response = {};

    var name = req.body.name;
    var email = req.body.email;
    var password = req.body.password;

    if (name.length >= 3 && validateEmail(email) && password.length >= 5) {
        newUser.name = req.body.name;
        //add validation
        newUser.email = req.body.email;
        //SHA1 algorithm - see shattered.io
        newUser.password = require('crypto')
            .createHash('sha1')
            .update(req.body.password)
            .digest('base64');
        newUser.save(function(err) {
            if (err) {
                if (err.errmsg.includes("duplicate")) {
                    if (err.errmsg.includes("name")) {
                        response = {
                            "error": true,
                            "message": "User already exists"
                        };
                    } else if (err.errmsg.includes("email")) {
                        response = {
                            "error": true,
                            "message": "E-mail adress already registered"
                        };
                    }
                } else {
                    response = {
                        "error": true,
                        "message": err.errmsg
                    };
                }

            } else {
                response = {
                    "error": false,
                    "message": newUser.name + " successfully registered"
                };
            }
            res.json(response);
        });
    } else {
        if (name.length < 3) {
            response = {
                "error": true,
                "message": "Username needs to be at least 3 characters long"
            }
        } else if (!validateEmail(email)) {
            response = {
                "error": true,
                "message": "Invalid e-mail adress"
            }
        } else {
            response = {
                "error": true,
                "message": "Password needs to be at least 5 characters long"
            }
        }
        res.json(response);
    }

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
            if (req.body.name !== undefined) {
                // case where name needs to be updated
                data.name = req.body.name;
            }
            if (req.body.avatar !== undefined) {
                // case where name needs to be updated
                data.avatar = req.body.avatar;
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

exports.resetPassword = function(req, res) {
    var response = {};
    var newPassword = random.getRandomPassword();
    User.findOne({
        email: req.body.email
    }, function(err, user) {
        if (err) {
            response = {
                "error": true,
                "message": "Error fetching data"
            };
        } else {
            if (user == null) {
                response = {
                    "error": true,
                    "message": "Couldn't find user with this e-mail address"
                }
            } else {
                mail.sendResetPassword(user.email, newPassword, function(error, info) {
                    if (error) {
                        console.log(error);
                        response = {
                            "error": true,
                            "message": "Password reset failed"
                        };
                    } else {
                        console.log('Message %s sent: %s', info.messageId, info.response);
                        response = {
                            "error": false,
                            "message": "New password of user "+user.name+" was sent to " + user.email
                        };
                        user.password = require('crypto')
                            .createHash('sha1')
                            .update(newPassword)
                            .digest('base64');
                        // save the data
                        user.save(function(err) {
                            if (err) {
                                response = {
                                    "error": true,
                                    "message": "Error updating data"
                                };
                            }

                        })
                    }
                    res.json(response);
                });
            }

        }
    });
}
