const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const sessions = require("express-session"); // install express-session
const KnexSessionStore = require("connect-session-knex")(sessions); // THIS MUST BE *AFTER* THE SESSION ABOVE

const authRouter = require("../auth/auth-router.js");
const usersRouter = require("../users/users-router.js");
const knex = require("../database/dbConfig.js");

const server = express();

const sessionConfig = {
  // session storage options
  name: "chocolateChip", // default would be sid
  secret: "keep it secret, keep it safe", // used for encryption (must be an environment variable)
  saveUninitialized: true, // has implications with GDPR laws, must be set false in production.
  resave: false,

  // how to store the sessions
  store: new KnexSessionStore({
    // DO NOT FORGET THE new KEYWORD!!!
    knex, // imported from dbConfig.js
    createtable: true,
    clearInterval: 1000 * 60 * 10, // clears the expired sessions
    sidfieldname: "sid",
    // optional below
    tablename: "sessions"
  }),
  // cookie options
  cookie: {
    maxAge: 1000 * 60 * 10, // 10 minutes in milliseconds
    secure: false, // if false, the cookie is sent over http, if true, only sent over https (in production, this should be set to true)
    httpOnly: true // if true, JS cannot access the cookie
  }
};

server.use(helmet());
server.use(express.json());
server.use(cors());
server.use(sessions(sessionConfig)); // THIS is what adds a req.session object

server.use("/api/auth", authRouter);
server.use("/api/users", usersRouter);

server.get("/", (req, res) => {
  res.json({ api: "up" });
});

module.exports = server;
