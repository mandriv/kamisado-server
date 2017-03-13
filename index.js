var express = require("express");
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var bodyParser = require("body-parser");
var usersDB = require("./modules/mongoUsers.js");
var gamesDB = require("./modules/mongoGames.js");
var router = express.Router();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    "extended": false
}));

router.get("/", function(req, res) {
    res.json({
        "error": false,
        "message": "Connected to the Kamisado HTTP Server, use /auth to authenticate"
    });
});

router.route("/auth").post(usersDB.authenticateUser);
router.route("/users").post(usersDB.postUsers);
router.route("/users/resetPassword").post(usersDB.resetPassword);
router.use(usersDB.verifyToken);
router.route("/users").get(usersDB.getUsers);
router.route("/users/:id").get(usersDB.getUserByID).put(usersDB.putUserByID).delete(usersDB.deleteUserById);
router.route("/games").get(gamesDB.getGames).post(gamesDB.postGames);
router.route("/games/:id").get(gamesDB.getGameByID).put(gamesDB.putGameByID).delete(gamesDB.deleteGameById);

app.use('/', router);

io.on('connection', function(socket){
  socket.on('chat message', function(msg){
    io.emit('chat message', msg);
  });
});

server.listen(process.env.PORT || 3000);

console.log("Server is up and running...");
