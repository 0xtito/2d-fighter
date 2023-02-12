var canvas = document.getElementById("canvas");
var cx = canvas.getContext("2d");
var startTime = Date.now();
canvas.width = 1296;
canvas.height = 472;

var background = new Image();
background.src = "./images/backgrounds/game_background.png";

var background_stars = new Image();
var starsFrame = 0;
// var stars_max_frame = 43;
background_stars.src = "./images/backgrounds/blue_stars.gif";
// background_stars.onload = function () {
//   cx.drawImage(background_stars, 0, 0, 620, 472);
//   cx.drawImage(background_stars, 620, 0, 620, 472);
// };

// var background_milky_way = new Image();
// background_milky_way.src = "./images/backgrounds/blue_milky_way.gif";
// background_milky_way.onload = function () {
//   cx.drawImage(background_milky_way, 620, 0, 620, 240);
// };

var platform = new Image();
platform.src = "./images/warped_city_files/ENVIRONMENT/platform.png";
var basePlatWidth = 46;
var basePlatHeight = 16;

var platformCenter = new Image();
platformCenter.src =
  "./images/warped_city_files/ENVIRONMENT/platform_center.png";
var centerPlatWidth = 30;

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

// for testing
var playerJoined = true;

var players = {};
var buck, player2;
var that = this;
var keys = {};

var game;

function animate() {
  cx.clearRect(0, 0, canvas.width, canvas.height);
  // cx.drawImage(background, 0, 0, canvas.width, canvas.height);
  // manageBackground();
  createPlayer();
  showCharacter();
  boundaries();
  bindKeys(players);
  updatePlayers();
  buildPlatforms();
  checkPlayerContact();
  detectCollisionWithElements();

  game = requestAnimationFrame(animate);
}

function detectCollisionWithElements() {
  var playersArray = Object.values(players);
  for (var i = 0; i < playersArray.length; i++) {
    var { char } = playersArray[i];
    for (var j = 0; j < platforms.length; j++) {
      // detectCollision(char, platforms[j]);
      detectPlayerPlatformCollision(char, platforms[j]);
    }
  }
}

function createPlayer() {
  if (playerJoined) {
    buck = new Buck();
    buck.init();
    players.player1 = { char: buck, keys: [] };
    // players.player= [];
    // players.push(buck);
    playerJoined = false;
    console.log(players);
  }
}

function checkPlayerContact() {
  var playersArray = Object.entries(players);

  for (var i = 0; i < playersArray.length; i++) {
    var [name, { char }] = playersArray[i];
    if (char.y >= canvas.height - char.h) {
      char.y = canvas.height - char.h;
      char.grounded = true;
      char.jumping = false;
    } else {
    }
  }
}

function showCharacter() {
  var playersArray = Object.entries(players);

  for (var i = 0; i < playersArray.length; i++) {
    var [name, { char }] = playersArray[i];
    char.draw();
  }
}

function updatePlayers() {
  var playersArray = Object.entries(players);
  var gravity = 0.2;
  var friction = 0.9;

  for (var i = 0; i < playersArray.length; i++) {
    var [name, { char, keys }] = playersArray[i];

    // var char = playerInfo;
    if (keys.includes("ArrowUp")) {
      if (!char.jumping && char.grounded) {
        console.log("jump");
        char.jumping = true;
        char.grounded = false;
        char.velY = -(char.speed / 2 + 5.5);
      }
      // test for direction char is facing
    }

    if (keys.includes("ArrowRight")) {
      char.spriteCharHeight = 20;

      // if (keys.includes("ArrowRight") && !keys.includes("ArrowLeft")) {
      char.facingRight = true;
      // if standing still, increase velocity (by 1) to the right
      if (char.velX < char.speed) {
        char.velX++;
      }

      // test for direction char is facing and if jumping
      if (!char.jumping) {
        char.sprite.src = "./images/buck_borris/run_right.png";

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
    }

    if (keys.includes("ArrowLeft")) {
      // if (keys.includes("ArrowLeft") && !keys.includes("ArrowRight")) {
      // if standing still, increase velocity (by 1) to the left
      char.spriteCharHeight = 20;
      char.facingRight = false;
      if (char.velX > -char.speed) {
        char.velX--;
      }

      // test for direction char is facing and if jumping
      if (!char.jumping) {
        char.sprite.src = "./images/buck_borris/run_left.png";

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
    }

    if (char.jumping && !char.grounded) {
      char.spiriteCharWidth = 15;

      if (char.facingRight) {
        char.frame = 0;
        char.sprite.src = "./images/buck_borris/jump_right.png";
      } else {
        char.frame = 0;
        char.sprite.src = "./images/buck_borris/jump_left.png";
      }
    }

    if (char.grounded) {
      char.velY = 0;
      // gravity = 0;
      if (
        keys.length == 0 ||
        (keys.includes("ArrowRight") && keys.includes("ArrowLeft"))
      ) {
        char.spriteCharHeight = 19;
        if (char.facingRight) {
          char.sprite.src = "./images/buck_borris/idle_right.png";
        } else if (!char.facingRight) {
          char.sprite.src = "./images/buck_borris/idle_left.png";
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
        // gravity = 6.8;
      }
    }
    // console.log(char.velY);

    char.velX *= friction;
    char.velY += gravity;
    char.x += char.velX;
    char.y += char.velY;
  }
}

function bindKeys() {
  var playersArray = Object.entries(players);
  for (var i = 0; i < playersArray.length; i++) {
    var [name, playerInfo] = playersArray[i];
    document.addEventListener("keydown", function (event) {
      if (!playerInfo.keys.includes(event.code)) {
        playerInfo.keys.push(event.code);
      }
    });

    document.addEventListener("keyup", function (event) {
      playerInfo.keys = playerInfo.keys.filter((key) => key !== event.code);
    });
  }
}

function Buck() {
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
  this.spiriteCharWidth = 14; // 12
  this.spriteCharHeight = 19; // 18
  this.frame = 0;
  this.sprite;
  this.grounded = false;
  this.jumping = false;
  this.facingRight;
  this.tickCounter;
  this.maxTick;
  this.collisionDirection;

  var that = this;

  this.init = function () {
    that.x = 10;
    that.y = canvas.height - 150;
    that.frame = 0;
    that.tickCounter = 0;
    that.maxTick = 22;
    that.facingRight = true;
    that.collisionDirection = null;

    that.sprite = new Image();
    // right now just adding idle, what I can do is create an object, with the key
    // being the image name and the value being the location
    // this could also be done with switch case maybe
    that.sprite.src = "./images/buck_borris/idle_right.png";
  };

  this.draw = function () {
    that.sY = that.frame * that.spriteCharHeight;

    cx.drawImage(
      that.sprite,
      that.sX,
      that.sY,
      that.spiriteCharWidth,
      that.spriteCharHeight,
      that.x,
      that.y,
      that.w,
      that.h
    );
  };
}

function boundaries() {
  // x
  var playersArray = Object.entries(players);
  for (var i = 0; i < playersArray.length; i++) {
    var [name, { char }] = playersArray[i];
    var w = char.w;
    var h = char.h;
    // var xSpeed = players[i].xSpeed;
    // var ySpeed = players[i].ySpeed;
    if (char.x < 0) {
      char.x = 0;
      char.collisionDirection = "left";
    } else if (char.x > canvas.width - w) {
      char.x = canvas.width - w;
      char.collisionDirection = "right";
    }
    // y
    if (char.y < 0) {
      char.y = 0;
      char.collisionDirection = "above";
      // ySpeed = 0
    } else if (char.y > canvas.height - h) {
      char.y = canvas.height - h;
      char.collisionDirection = "below";
      char.grounded = true;
      char.jumping = false;
    }
  }
}

function detectPlayerPlatformCollision(player, platform) {
  player.collisionDirection = detectCollision(player, platform);
  // essentially the distance from one element (player) from another (platform)
  // console.log(player, platform);

  if (player.collisionDirection == "below") {
    player.grounded = true;
    player.jumping = false;
  }
  // checking if the player is touching under the platform
  else if (player.collisionDirection == "above") {
    player.velY *= -1;
  }
  // check if the player is touching the side
  if (
    player.collisionDirection == "left" ||
    player.collisionDirection == "right"
  ) {
    player.velX = 0;
    player.jumping = false;
  }
}

function detectCollision(itemA, itemB) {
  var collisionDirection = null;
  // essentially the distance from one element (player) from another (platform)
  let distance = {
    vectorX: itemA.x + (itemA.w - 10) / 2 - (itemB.x + itemB.w / 2),
    vectorY: itemA.y + itemA.h / 2 - (itemB.y + itemB.h / 2),
  };

  // adding half of each objects width together
  var addedWidths = itemA.w / 2 + itemB.w / 2 - 15;
  var addedHeights = itemA.h / 2 + itemB.h / 2;

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
        itemA.y -= offsetY;
      }
    } else {
      if (distance.vectorX > 0) {
        collisionDirection = "left";
        itemA.x += offsetX;
      } else {
        collisionDirection = "right";
        itemA.x -= offsetX;
      }
    }
  }
  return collisionDirection;

  // console.log(platform);
  // var xPlayer = player.x;
  // var yPlayer = player.y;
  // var wPlayer = player.width;
  // var hPlayer = player.height;

  // var xPlatform = platform.x;
  // var yPlatform = platform.y;
  // var wPlatform = platform.w;
  // var hPlatform = platform.h;

  // if (
  //   xPlayer + wPlayer > xPlatform &&
  //   xPlayer < xPlatform + wPlatform &&
  //   yPlayer + hPlayer > yPlatform &&
  //   yPlayer < yPlatform + hPlatform
  // ) {
  // checking if player is touching the top of the platform
  // if (yPlayer + hPlayer > yPlatform) {
  //   console.log("touched top");

  //   player.grounded = true;
  //   player.jumping = false;
  //   player.y = yPlatform - hPlayer;
  // }
  // checking if the player is touching under the platform
  // else if (yPlayer < yPlatform + hPlatform) {
  //   console.log("touched bottom");

  // player.velY = 0;

  //   player.y = yPlatform + hPlatform + 0.1;
  // }
  // check if the player is touching the side
  //   else if (xPlayer + wPlayer == xPlatform) {
  //     console.log("touched side");
  //     player.velX = -1;
  //     player.x = player.x;
  //   }
  // }
  // else {
  //   if (player.grounded && !player.jumping && player.y < canvas.height) {
  //     player.grounded = false;
  //   }
  // }
}

// function collisionCheck()

function buildPlatforms() {
  var width = 51;
  var height = 20;

  for (var i = 0; i < platforms.length; i++) {
    var { x, y, w, h } = platforms[i];
    cx.drawImage(platform, x, y, w, h);
  }

  // cx.fillStyle = "black";
  // var platHeight = 30;
  // var platWidth = canvas.width;

  //   cx.fillRect(0, canvas.height - platHeight, platWidth, platHeight);
}
createFloor();
animate();
