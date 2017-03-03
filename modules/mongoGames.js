var mongoose = require("mongoose");
var jwt = require('jsonwebtoken');
mongoose.Promise = global.Promise;
var usersDB = require("./mongoUsers.js");
// create schema
var gameSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    mode: {
        type: String,
        required: true
    },
    pointLimit: {
        type: Number,
        required: true
    }
    player1_ID: {
        type: String,
        required: true
    },
    player2_ID: {
        type: String,
        default: ""
    },
    password: {
      type: String,
      default: ""
    },
    status: {
        type: String,
        default: "inLobby"
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
var Game = mongoose.model('Game', gameSchema);

var exports = module.exports = {};

exports.clearDatabase = function() {
    Game.remove({}, function(err) {
        console.log('collection removed')
    });
}

exports.getGames = function(req, res) {
    var response = {};
    Game.find({}, function(err, data) {
        if (err) {
            response = {
                "error": true,
                "message": "Error fetching data"
            }
        } else {
            response = {
                "error": false,
                "message": data
            }
        }
        res.json(response);
    });
}

exports.postGames = function(req, res) {
    var newGame = new Game();
    var response = {};
    newGame.name = req.body.name;
    newGame.mode = req.body.mode;
    newGame.password = req.body.password;
    newGame.pointLimit = req.body.limit;
    newGame.player1_ID = req.decoded.userID;
    newGame.save(function(err) {
        if (err) {
            response = {
                "error": true,
                "message": err.errmsg
            };
        } else {
            response = {
                "error": false,
                "message": "Game " + newGame.name + " added to database!"
            };
        }
        res.json(response);
    });
}

exports.getGameByID = function(req, res) {
    var response = {};
    Game.findById(req.params.id, function(err, data) {
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

exports.putGameByID = function(req, res) {
    var response = {};
    // first find out record exists or not
    // if it does then update the record
    Game.findById(req.params.id, function(err, data) {
        if (err) {
            response = {
                "error": true,
                "message": "Error fetching data"
            };
        } else {
            // we got data from Mongo.
            // change it accordingly.
            if (req.body.join == true) {
                data.player2 = req.decoded.name
                data.player2_ID = req.decoded.userID;
                data.inLobby = false;
            }
            if (req.body.time != undefined) {
                data.time = req.body.time;
            }
            if (req.body.P1score != undefined) {
                data.P1score = req.body.P1score;
            }
            if (req.body.P2score != undefined) {
                data.P2score = req.body.P2score;
            }
            if (req.body.finished != undefined) {
                data.finished = req.body.finished;
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

exports.deleteGameById = function(req, res) {
    var response = {};
    // find the data
    Game.findById(req.params.id, function(err, data) {
        if (err) {
            response = {
                "error": true,
                "message": "Error fetching data"
            };
        } else {
            // data exists, remove it.
            Game.remove({
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
