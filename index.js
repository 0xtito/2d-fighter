var express = require("express");
var app = express();
var server = require("http").createServer(app);
var socketIO = require("socket.io");

var io = socketIO(server);

var players = [];

io.on("connection", (socket) => {
  // getting a clients local player, storing it in the server,
  // and then sending it to the other player
  socket.on("updatePlayer", (player) => {
    socket.broadcast.emit("retrieveOtherPlayer", player);
  });

  socket.on("createPlayer", (x, y) => {
    var buck = new Buck(socket.id, x, y);
    buck.init();
    players.push(buck);
    io.emit("newPlayer", players[players.length - 1]);
    if (players.length == 2) {
      io.emit("start", players);
    }
  });

  socket.on("playerQuit", (player) => {
    io.emit("playerQuit", player);
    if (players.length < 2) {
      console.log("stop game");
      io.emit("stopGame", players);
    }
    socket.disconnect();
  });

  socket.on("gameOver", (_players) => {
    players = [];
    socket.broadcast.emit("gameOver", _players);
  });
});

function Buck(id, x, y) {
  if (players.length > 0) {
    this.name = "buck_borris2";
  } else {
    this.name = "buck_borris";
  }
  this.id = id;
  this.x = x;
  this.y = y;
  this.sX = 0; // sprite position
  this.sY = 0; // sprite position
  this.speed = 3;
  this.velX = 0;
  this.velY = 0;
  this.frame;
  this.w = 42;
  this.h = 69;
  this.spriteCharWidth = 14; // 12
  this.spriteCharHeight = 19; // 18
  this.frame = 0;
  this.spriteUrl;

  this.grounded = false;
  this.jumping = false;
  this.facingRight;
  this.tickCounter;
  this.maxTick;
  this.collisionDirection;
  this.attacking;
  this.health;
  this.invulnerable;

  var that = this;

  this.init = function () {
    that.frame = 0;
    that.tickCounter = 0;
    that.maxTick = 22;
    that.facingRight = true;
    that.collisionDirection = null;
    that.attacking = false;
    that.health = 5;
    that.invulnerable = false;
    that.spriteUrl = `./images/${that.name}/idle_right.png`;

    // right now just adding idle, what I can do is create an object, with the key
    // being the image name and the value being the location
    // this could also be done with switch case maybe
    // console.log(players.length)
    // if (players.length == 0) {
    //   that.spriteUrl = "./game/images/buck_borris/idle_right.png";
    // } else {
    //   that.spriteUrl = "./game/images/buck_borris2/idle_right.png";
    // }
  };
}

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.use(express.static(__dirname + "/game"));

server.listen(3001, () => {
  console.log(`listening on port 3001`);
});
