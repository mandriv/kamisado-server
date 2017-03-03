# Kamisado server

This project is a server-side implementation of RESTful API needed for keeping users database (all dbs are in MongoDB) and games (match-making) database. It also implements sockets connection for an actual game (receiving and sending consecutive moves of players). Client-side will be soon available (written in Java).

API:

/(GET)

/auth(POST)

/users (GET, POST)

/users/:id (GET, POST, PUT, DELETE)

/games (GET, POST)

/games (GET, POST, PUT, DELETE)

To get access to /users and /games user need a token authorization. This is obtained by POSTing on /auth with nickname and password.

Sockets:

Coming soon

Written in node.js (+express.js, mongoDB / mongoose).
