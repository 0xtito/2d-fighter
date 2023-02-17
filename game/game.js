var canvas = document.getElementById("canvas");
var cx = canvas.getContext("2d");
canvas.width = 1296;
canvas.height = 472;

var socket = io();

var preloader, playerImages;
var background = new Image();
var playerHealth = {
  full: new Image(),
  breaking1: new Image(),
  breaking2: new Image(),
  breaking3: new Image(),
  breaking4: new Image(),
  broken: new Image(),
};
var platform = new Image();
var basePlatWidth = 46;
var basePlatHeight = 16;
var platformCenter = new Image();
var centerPlatWidth = 30;

// preloads character and world images when the
// page first loads
function initImages() {
  background.src = "./images/backgrounds/game_background.png";
  platform.src = "./images/warped_city_files/ENVIRONMENT/platform.png";
  platformCenter.src =
    "./images/warped_city_files/ENVIRONMENT/platform_center.png";
  var playerHealthArr = Object.entries(playerHealth);

  for (let i = 0; i < playerHealthArr.length; i++) {
    var [type, image] = playerHealthArr[i];

    if (i != 0 && i != playerHealthArr.length - 1) {
      image.src = `./images/health_hearts/damage_${i}.png`;
      playerHealth[image] = image;
    } else if (i == 0) {
      image.src = "./images/health_hearts/full_heart.png";
      playerHealth[type] = image;
    } else if (i == playerHealthArr.length - 1) {
      image.src = "./images/health_hearts/broken.png";
      playerHealth[type] = image;
    }
    // playerHealthArr[i].image = image
  }
}

var platforms = [
  { x: 400, y: 360, w: basePlatWidth * 2, h: basePlatHeight },
  {
    x: canvas.width / 2 - 51,
    y: 360,
    w: basePlatWidth * 2,
    h: basePlatHeight,
  },
  { x: 800, y: 360, w: basePlatWidth * 2, h: basePlatHeight },
  { x: 500, y: 250, w: basePlatWidth * 2, h: basePlatHeight },
  { x: 700, y: 250, w: basePlatWidth * 2, h: basePlatHeight },
];

var floorPlats = [];
function createFloor() {
  var totalPlats = 20;
  for (let i = 0; i < totalPlats; i++) {
    if (i == 0) {
      floorPlats.push({
        x: -1,
        y: canvas.height - basePlatHeight,
        width: basePlatWidth * 2,
        height: basePlatHeight,
      });
    } else if (i == totalPlats - 1) {
      floorPlats.push({
        x: 102 + (totalPlats - 2) * 60,
        y: canvas.height - basePlatHeight,
        width: basePlatWidth * 2,
        height: basePlatHeight,
      });
    } else {
      floorPlats.push({
        x: 60 * i,
        y: canvas.height - basePlatHeight,
        width: basePlatWidth * 2,
        height: basePlatHeight,
      });
    }
  }
}

var players = [];
var that = this;
var startGame = false;
var gameOver = false;
var dataReceived = false;
var localPlayerId, otherPlayerId;

window.onload = function () {
  initImages();
  createFloor();
  preloader = new Preloader();
  preloader.init();
  console.log(preloader);

  animate();
};

socket.on("start", (playersArr) => {
  // players = playersArr
  console.log("start", playersArr);
  startGame = true;
});

socket.on("newPlayer", (newPlayer) => {
  console.log("new player", newPlayer);
  if (newPlayer.id == socket.id) {
    localPlayerId = newPlayer.id;
  } else {
    otherPlayerId = newPlayer.id;
  }
  players.push({ char: newPlayer, keys: [] });
  if (players.length == 2) {
    startGame = true;
  }
});

// getting the other client's player info
socket.on("retrieveOtherPlayer", (player) => {
  // not necessary, but useful to make the
  var decompressedData = pako.inflate(player, { to: "string" });
  var char = JSON.parse(decompressedData);
  for (var i = 0; i < players.length; i++) {
    // basically, if the other player
    if (char.id == players[i].char.id) {
      players[i].char = char;
      dataReceived = true;
    }
  }
});

socket.on("stopGame", (_players) => {
  console.log("stop game");
  game = null;
  startGame = false;
  gameOver = true;
});

socket.on("playerQuit", (player) => {
  var i = players.findIndex((_player) => {
    return _player.char.id == player.char.id;
  });
  players.splice(i, 1);
  gameOver = true;
  // startGame = false;
});

socket.on("gameOver", (_players) => {
  gameOver = true;
});

window.addEventListener("beforeunload", function (e) {
  // e.preventDefault(); // Cancel the event
  // e.returnValue = ''; // Chrome requires returnValue to be set
  gameOver = true;
  socket.disconnect();
});

var game;
function animate() {
  if (startGame) {
    cx.clearRect(0, 0, canvas.width, canvas.height);
    draw(players);
    healthDisplay();
    for (var i = 0; i < players.length; i++) {
      if (players[i].char.id == localPlayerId) {
        bindKeys(players[i]);
        updateClientPlayer(players[i]);
      }
    }
    detectCollisionWithElements();
  }
  boundaries();
  buildPlatforms();
  if (gameOver) {
    game = null;
    console.log("game over");
  } else {
    game = requestAnimationFrame(animate);
  }
}

function draw(players) {
  for (var i = 0; i < players.length; i++) {
    players[i].char.sY =
      players[i].char.frame * players[i].char.spriteCharHeight;
    var imageName = players[i].char.spriteUrl.split("/");
    imageName = imageName[imageName.length - 1].split(".")[0] + `_${i + 1}`;
    cx.drawImage(
      preloader.images[imageName],
      players[i].char.sX,
      players[i].char.sY,
      players[i].char.spriteCharWidth,
      players[i].char.spriteCharHeight,
      players[i].char.x,
      players[i].char.y,
      players[i].char.w,
      players[i].char.h
    );
  }
}

function joinGame() {
  if (players.length < 2) {
    var ready = prompt("Are you ready to play? (y)");
    if (ready == "y") {
      console.log("player is ready");
      if (players.length == 0) {
        socket.emit("createPlayer", 10, canvas.height - 100);
      } else {
        socket.emit("createPlayer", 1200, canvas.height - 100);
      }
    } else {
      console.log("not ready");
    }
  }
  // else {
  //   alert("At max players");
  // }
}

function quitGame() {
  console.log(socket.id);
  var i = players.findIndex((player) => {
    return player.char.id == socket.id;
  });
  // players.splice(i, 0)
  console.log(`remove ${players[i].char}`);
  // socket.emit('playerQuit', players[i])
  socket.emit("gameOver", players);

  gameOver = true;
}

function detectCollisionWithElements() {
  detectPlayerAttackPlayer(players[0].char, players[1].char);
  // detectPlayerAttackPlayer(players[1].char, players[0].char);
  for (var i = 0; i < players.length; i++) {
    var { char } = players[i];
    for (var j = 0; j < platforms.length; j++) {
      detectPlayerPlatformCollision(char, platforms[j]);
    }
  }
}

function checkPlayerContact() {
  // var playersArray = players

  for (var i = 0; i < players.length; i++) {
    var { char, keys } = players[i];
    if (char.y >= canvas.height - char.h) {
      char.y = canvas.height - char.h;
      char.grounded = true;
      char.jumping = false;
    } else {
    }
  }
}

function healthDisplay() {
  var healthDisplayY = 20;
  var healthDisplayX1 = 20;
  var healthDisplayX2 = 1150;
  var healthSlots = 5;
  var { char: player1 } = players[0];
  var { char: player2 } = players[1];
  var brokenHearts1 = healthSlots - player1.health;
  var brokenHearts2 = healthSlots - player2.health;

  for (var i = 0; i < healthSlots; i++) {
    if (i < player1.health) {
      cx.drawImage(
        playerHealth.full,
        0,
        0,
        23,
        20,
        healthDisplayX1 + 12 * (i + i),
        healthDisplayY,
        23,
        20
      );
    } else {
      for (var j = 0; j < brokenHearts1; j++) {
        cx.drawImage(
          playerHealth.broken,
          0,
          0,
          23,
          20,
          healthDisplayX1 + 12 * (i + i),
          healthDisplayY,
          23,
          20
        );
      }
    }

    if (i < player2.health) {
      cx.drawImage(
        playerHealth.full,
        0,
        0,
        23,
        20,
        healthDisplayX2 + 12 * (i + i),
        healthDisplayY,
        23,
        20
      );
    } else {
      for (var j = 0; j < brokenHearts2; j++) {
        cx.drawImage(
          playerHealth.broken,
          0,
          0,
          23,
          20,
          healthDisplayX2 + 12 * (i + i),
          healthDisplayY,
          23,
          20
        );
      }
    }
  }
}

function bindKeys(localPlayer) {
  document.addEventListener("keydown", function (event) {
    if (!localPlayer.keys.includes(event.code)) {
      localPlayer.keys.push(event.code);
    }
  });

  document.addEventListener("keyup", function (event) {
    localPlayer.keys = localPlayer.keys.filter((key) => key !== event.code);
  });
}

function updateClientPlayer(player) {
  var gravity = 0.2;
  var friction = 0.9;

  var { char, keys } = player;
  if (keys.includes("Space") && !char.attacking && !char.invulnerable) {
    if (!char.attacking) {
      char.attacking = true;
      char.tickCounter = 0;
    }
  }
  // currently attacking
  if (char.attacking) {
    char.maxTick = 28;
    char.spriteCharHeight = 23;
    char.spriteCharWidth = 23;
    char.w = 69;
    char.h = 69;
    if (char.facingRight) {
      char.spriteUrl = `./images/${char.name}/attacks_right.png`;
    } else {
      char.spriteUrl = `./images/${char.name}/attacks_left.png`;
    }
    char.tickCounter += 1;

    if (char.tickCounter > char.maxTick / char.speed) {
      char.tickCounter = 0;
      if (char.frame < 5) {
        char.frame++;
      } else {
        char.frame = 0;
        char.maxTick = 22;
        char.tickCounter = 0;
        char.attacking = false;
      }
    }
  } else {
    char.spriteCharHeight = 19;
    char.spriteCharWidth = 14;
    char.w = 42;
    char.h = 69;
    char.maxTick = 22;
  }

  if (char.invulnerable) {
    if (char.facingRight) {
      char.spriteUrl = `./images/${char.name}/damaged_right.png`;
    } else {
      char.spriteUrl = `./images/${char.name}/damaged_left.png`;
    }

    char.spriteCharHeight = 16;
    char.spriteCharWidth = 16;

    char.tickCounter += 1;

    if (char.tickCounter > char.maxTick / char.speed) {
      char.tickCounter = 0;

      if (char.frame < 5) {
        char.frame++;
      } else {
        char.invulnerable = false;
        // char.health -= 1;
        if (char.health == 0) {
          socket.emit("gameOver", players);
          gameOver = true;
        }
        char.frame = 0;
      }
    }
  }

  if (keys.includes("ArrowUp")) {
    if (!char.jumping && char.grounded) {
      char.spriteCharHeight = 19;
      char.spriteCharWidth = 14;
      char.jumping = true;
      char.grounded = false;
      char.velY = -(char.speed / 2 + 5.5);
    }
  }

  if (keys.includes("ArrowRight")) {
    char.facingRight = true;
    // if standing still, increase velocity (by 1) to the right
    if (char.velX < char.speed) {
      char.velX++;
    }

    if (!char.attacking && !char.invulnerable) {
      char.spriteCharHeight = 20;

      // test for direction char is facing and if jumping
      if (!char.jumping) {
        char.spriteUrl = `./images/${char.name}/run_right.png`;

        char.tickCounter += 1;

        if (char.tickCounter > char.maxTick / char.speed) {
          char.tickCounter = 0;

          if (char.frame < 3) {
            char.frame++;
          } else {
            char.frame = 0;
          }
        }
      }
    }
  }

  if (keys.includes("ArrowLeft")) {
    char.facingRight = false;
    if (char.velX > -char.speed) {
      char.velX--;
    }

    if (!char.attacking && !char.invulnerable) {
      char.spriteCharHeight = 20;

      // test for direction char is facing and if jumping
      if (!char.jumping) {
        char.spriteUrl = `./images/${char.name}/run_left.png`;

        char.tickCounter += 1;

        if (char.tickCounter > char.maxTick / char.speed) {
          char.tickCounter = 0;

          if (char.frame < 3) {
            char.frame++;
          } else {
            char.frame = 0;
          }
        }
      }
    }
  }

  if (char.jumping && !char.grounded) {
    if (!char.attacking && !char.invulnerable) {
      char.spriteCharWidth = 15;

      if (char.facingRight) {
        char.frame = 0;
        char.spriteUrl = `./images/${char.name}/jump_right.png`;
      } else {
        char.frame = 0;
        char.spriteUrl = `./images/${char.name}/jump_left.png`;
      }
    }
  }

  if (char.grounded) {
    char.velY = 0;
    if (
      (keys.length == 0 ||
        (keys.includes("ArrowRight") && keys.includes("ArrowLeft"))) &&
      !char.attacking &&
      !char.invulnerable
    ) {
      char.spriteCharHeight = 19;
      char.spriteCharWidth = 14;
      if (char.facingRight) {
        char.spriteUrl = `./images/${char.name}/idle_right.png`;
      } else if (!char.facingRight) {
        char.spriteUrl = `./images/${char.name}/idle_left.png`;
      }
      char.tickCounter += 1;

      if (char.tickCounter > char.maxTick / char.speed) {
        char.tickCounter = 0;

        if (char.frame == 0 || char.frame == 1 || char.frame == 2) {
          char.frame++;
        } else {
          char.frame = 0;
        }
      }
    }

    if (char.collisionDirection == null) {
      char.grounded = false;
    }
  }

  char.velX *= friction;
  char.velY += gravity;
  char.x += char.velX;
  char.y += char.velY;
  player.char = char;

  // not necessary - just making send data from the server
  // to the other client more efficient/quicker
  var jsonPlayer = JSON.stringify(player.char);
  var compressedPlayer = pako.gzip(jsonPlayer);

  // socket.emit("updatePlayer", player.char)
  socket.emit("updatePlayer", compressedPlayer);
}

function detectPlayerAttackPlayer(playerA, playerB) {
  var { collisionDirection, offsetX, offsetY } = detectCollision(
    playerA,
    playerB,
    "playerToPlayer"
  );

  // checking if they are event making contact
  if (collisionDirection != null) {
    // checking that neither of them are invulnerable, if so punches wont register.
    if (!playerA.invulnerable && !playerB.invulnerable) {
      // playerA is attacking playerB (add in check to make sure playerB is not blocking)
      if (playerA.attacking && !playerB.attacking) {
        playerB.health -= 1;
        playerB.invulnerable = true;
        playerB.frame = 0;
        // hitting from the left and facing the right direction
        if (playerA.facingRight && collisionDirection == "right") {
          playerA.velX -= offsetX;
          console.log(`${playerA.name} punched ${playerB.name}`);
        } else if (!playerA.facingRight && collisionDirection == "left") {
          playerA.velX += offsetX;
          console.log(`${playerA.name} punched ${playerB.name} facing left`);
        }
      }
      // playerB is attacking playerA (add in check to make sure playerA is not blocking)
      else if (playerB.attacking && !playerA.attacking) {
        playerA.health -= 1;
        playerA.invulnerable = true;
        playerA.frame = 0;
        if (playerB.facingRight && collisionDirection == "right") {
          playerB.velX -= offsetX;
          console.log(`${playerB.name} punched ${playerA.name}`);
        }
      } else if (playerA.attacking && playerB.attacking) {
        // playerA.velX += offsetX;
        // if they attack each other at the same time, they both just get sent flying back(?)
        // as if they parried one another
      } else {
        // neither are attacking, but they are colliding
      }
    }
  } else {
    // console.log("not touching each other");
  }
}

function Buck() {
  if (players.length > 0) {
    this.name = "buck_borris2";
  } else {
    this.name = "buck_borris";
  }
  this.id;
  this.x;
  this.y;
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
  this.jumping = true;
  this.facingRight;
  this.tickCounter;
  this.maxTick;
  this.collisionDirection;
  this.attacking;
  this.health;
  this.invulnerable;

  var that = this;

  this.init = function () {
    that.id = socket.id;
    if (that.name != "buck_borris") {
      that.x = 300;
    } else {
      that.x = 10;
    }
    that.y = canvas.height - 150;
    that.frame = 0;
    that.tickCounter = 0;
    that.maxTick = 22;
    that.facingRight = true;
    that.collisionDirection = null;
    that.attacking = false;
    that.health = 5;
    that.invulnerable = false;

    // right now just adding idle, what I can do is create an object, with the key
    // being the image name and the value being the location
    // this could also be done with switch case maybe
    // if (players.length == 0) {
    //   that.spriteUrl = "./images/buck_borris/idle_right.png";
    // } else {
    //   that.spriteUrl = "./images/buck_borris2/idle_right.png";
    // }
  };
}

function boundaries() {
  for (var i = 0; i < players.length; i++) {
    if (players[i].char.x < 0) {
      players[i].char.x = 0;
      players[i].char.collisionDirection = "left";
    } else if (players[i].char.x > canvas.width - players[i].char.w) {
      players[i].char.x = canvas.width - players[i].char.w;
      players[i].char.collisionDirection = "right";
    }
    if (players[i].char.y < 0) {
      players[i].char.y = 0;
      players[i].char.collisionDirection = "above";
    } else if (players[i].char.y > canvas.height - players[i].char.h) {
      players[i].char.y = canvas.height - players[i].char.h;
      players[i].char.collisionDirection = "below";
      players[i].char.grounded = true;
      players[i].char.jumping = false;
    }
  }
}

function detectPlayerPlatformCollision(player, platform) {
  var { collisionDirection, offsetX, offsetY } = detectCollision(
    player,
    platform,
    "playerToPlat"
  );
  player.collisionDirection = collisionDirection;

  if (player.collisionDirection == "below") {
    player.y -= offsetY;
    player.grounded = true;
    player.jumping = false;
  }
  // checking if the player is touching under the platform
  else if (player.collisionDirection == "above") {
    player.velY *= -1;
  }
  // check if the player is touching the side
  if (player.collisionDirection == "left") {
    player.x += offsetX;
    player.jumping = false;
  } else if (player.collisionDirection == "right") {
    player.x -= offsetX;
    player.jumping = false;
  }
}

function detectCollision(itemA, itemB, type) {
  var collisionDirection = null;
  var addedWidths, addedHeights;
  // essentially the distance from one element (player) from another (platform)
  let distance = {
    vectorX: itemA.x + itemA.w / 2 - (itemB.x + itemB.w / 2),
    vectorY: itemA.y + itemA.h / 2 - (itemB.y + itemB.h / 2),
  };

  // adding half of each objects width together, depending on the type adjust sizes
  if (type == "playerToPlat") {
    addedWidths = itemA.w / 2 + itemB.w / 2 - 15;
  } else if (type == "playerToPlayer") {
    addedWidths = itemA.w / 2 - 5 + itemB.w / 2 - 5;
  } else {
    addedWidths = itemA.w / 2 + itemB.w / 2;
  }
  addedHeights = itemA.h / 2 + itemB.h / 2;

  // if the x and y distance between the two items is less than the addedWidths/addedHeights,
  // there must have been a collision
  if (
    Math.abs(distance.vectorX) < addedWidths &&
    Math.abs(distance.vectorY) < addedHeights
  ) {
    // now the job is to figure out what direction the collision is coming from (with respect to itemA)

    // the sum of half of each obj's width minus the x vector distance between the two objects (measured
    // from the center)
    var offsetX = addedWidths - Math.abs(distance.vectorX);
    var offsetY = addedHeights - Math.abs(distance.vectorY);

    if (offsetX >= offsetY) {
      if (distance.vectorY > 0 && distance.vectorY < 70) {
        collisionDirection = "above";
      } else if (distance.vectorY < 0) {
        collisionDirection = "below";
      }
    } else {
      if (distance.vectorX > 0) {
        collisionDirection = "left";
      } else {
        collisionDirection = "right";
      }
    }
  }
  return { collisionDirection, offsetX, offsetY };
}

function buildPlatforms() {
  var width = 51;
  var height = 20;

  for (var i = 0; i < platforms.length; i++) {
    var { x, y, w, h } = platforms[i];
    cx.drawImage(platform, x, y, w, h);
  }
}

function gameOver() {
  gameOver = true;
  game = null;
}
