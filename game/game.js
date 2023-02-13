var canvas = document.getElementById("canvas");
var cx = canvas.getContext("2d");
canvas.width = 1296;
canvas.height = 472;

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

// for testing
var playerJoined = true;
var secondPlayerJoined = true;

var players = {};
var buck, buck2;
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
  healthDisplay();

  game = requestAnimationFrame(animate);
}

function detectCollisionWithElements() {
  var playersArray = Object.values(players);
  detectPlayerAttackPlayer(playersArray[0].char, playersArray[1].char);
  detectPlayerAttackPlayer(playersArray[1].char, playersArray[0].char);
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
  }

  if (secondPlayerJoined) {
    buck2 = new Buck();
    buck2.init();
    players.player2 = { char: buck2, keys: [] };
    secondPlayerJoined = false;
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
  var playersArray = Object.values(players);

  for (var i = 0; i < playersArray.length; i++) {
    var { char, keys } = playersArray[i];
    char.draw();
  }
}

function healthDisplay() {
  var playersArr = Object.values(players);
  var healthDisplayHeight = 20;
  var healthDisplayWidth1 = 20;
  var healthDisplayWidth2 = 1150;
  var healthSlots = 5;
  var { char: player1 } = playersArr[0];
  var { char: player2 } = playersArr[1];
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
        healthDisplayWidth1 + 12 * (i + i),
        healthDisplayHeight,
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
          healthDisplayWidth1 + 12 * (i + i),
          healthDisplayHeight,
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
        healthDisplayWidth2 + 12 * (i + i),
        healthDisplayHeight,
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
          healthDisplayWidth2 + 12 * (i + i),
          healthDisplayHeight,
          23,
          20
        );
      }
    }
  }
}

function updatePlayers() {
  var playersArr = Object.values(players);
  var gravity = 0.2;
  var friction = 0.9;
  // console.log(player);

  for (var i = 0; i < playersArr.length; i++) {
    var { char, keys } = playersArr[i];

    if (keys.includes("Space") && !char.attacking) {
      if (!char.attacking) {
        char.attacking = true;
        char.tickCounter = 0;
      } else {
      }
    }
    if (char.attacking) {
      char.maxTick = 28;
      char.spriteCharHeight = 23;
      char.spriteCharWidth = 23;
      char.w = 69;
      char.h = 69;
      if (char.facingRight) {
        char.sprite.src = `./images/${char.name}/attacks_right.png`;
      } else {
        char.sprite.src = `./images/${char.name}/attacks_left.png`;
      }
      char.tickCounter += 1;

      if (char.tickCounter > char.maxTick / char.speed) {
        char.tickCounter = 0;
        if (char.frame < 5) {
          char.frame++;
          console.log(char.frame);
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

    if (keys.includes("ArrowUp")) {
      if (!char.jumping && char.grounded) {
        char.spriteCharHeight = 19;
        char.spriteCharWidth = 14;
        console.log("jump");
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

      if (!char.attacking) {
        char.spriteCharHeight = 20;

        // test for direction char is facing and if jumping
        if (!char.jumping) {
          char.sprite.src = `./images/${char.name}/run_right.png`;

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

      if (!char.attacking) {
        char.spriteCharHeight = 20;

        // test for direction char is facing and if jumping
        if (!char.jumping) {
          char.sprite.src = `./images/${char.name}/run_left.png`;

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
      if (!char.attacking) {
        char.spriteCharWidth = 15;

        if (char.facingRight) {
          char.frame = 0;
          char.sprite.src = `./images/${char.name}/jump_right.png`;
        } else {
          char.frame = 0;
          char.sprite.src = `./images/${char.name}/jump_left.png`;
        }
      }
    }

    if (char.grounded) {
      char.velY = 0;
      if (
        (keys.length == 0 ||
          (keys.includes("ArrowRight") && keys.includes("ArrowLeft"))) &&
        !char.attacking
      ) {
        char.spriteCharHeight = 19;
        if (char.facingRight) {
          char.sprite.src = `./images/${char.name}/idle_right.png`;
        } else if (!char.facingRight) {
          char.sprite.src = `./images/${char.name}/idle_left.png`;
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
  }
}

function detectPlayerAttackPlayer(playerA, playerB) {
  var collisionDirection = detectCollision(playerA, playerB, "playerToPlayer");
  console.log(playerA, collisionDirection, playerA.facingRight);

  if (collisionDirection != null) {
    if (playerA.attacking && !playerB.attacking) {
    } else if (playerB.attacking && !playerB.attacking) {
    } else if (playerA.attacking && playerB.attacking) {
    } else {
    }
  } else {
    console.log("not touching each other");
  }
}

function bindKeys() {
  var playersArray = Object.entries(players);
  for (var i = 0; i < playersArray.length; i++) {
    // var [name, playerInfo] = playersArray[i];
    var [name, playerInfo] = playersArray[0]; // changing to just controlling buck

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

function Hero() {
  // color is
  this.name = "buck_borris2";
  this.x;
  this.y;
  this.sX = 0; // sprite position
  this.sY = 0; // sprite position
  this.speed = 3;
  this.velX = 0;
  this.velY = 0;
  this.frame;
  this.w = 60;
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
  this.attacking;
  this.damageTaken;
  this.health;
  this.blocking;

  var that = this;

  this.init = function () {
    that.x = 450;
    that.y = canvas.height - 150;
    that.frame = 0;
    that.tickCounter = 0;
    that.maxTick = 22;
    that.facingRight = true;
    that.collisionDirection = null;
    that.attacking = false;

    that.sprite = new Image();
    // right now just adding idle, what I can do is create an object, with the key
    // being the image name and the value being the location
    // this could also be done with switch case maybe
    that.sprite.src = "./images/hero/idle_right.png";
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

function Buck() {
  if (players.player1) {
    this.name = "buck_borris2";
  } else {
    this.name = "buck_borris";
  }
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
  this.sprite;
  this.grounded = false;
  this.jumping = false;
  this.facingRight;
  this.tickCounter;
  this.maxTick;
  this.collisionDirection;
  this.attacking;
  this.health;

  var that = this;

  this.init = function () {
    that.x = 10;
    that.y = canvas.height - 150;
    that.frame = 0;
    that.tickCounter = 0;
    that.maxTick = 22;
    that.facingRight = true;
    that.collisionDirection = null;
    that.attacking = false;
    that.health = 5;

    that.sprite = new Image();
    // right now just adding idle, what I can do is create an object, with the key
    // being the image name and the value being the location
    // this could also be done with switch case maybe
    if (players.player1) {
      that.sprite.src = "./images/buck_borris/idle_right.png";
    } else {
      that.sprite.src = "./images/buck_borris2/idle_right.png";
    }
  };

  this.draw = function () {
    that.sY = that.frame * that.spriteCharHeight;
    cx.drawImage(
      that.sprite,
      that.sX,
      that.sY,
      that.spriteCharWidth,
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
  var { collisionDirection, offsetX, offsetY } = detectCollision(
    player,
    platform,
    "playerToPlat"
  );
  player.collisionDirection = collisionDirection;
  // player.collisionDirection = detectCollision(player, platform);
  // essentially the distance from one element (player) from another (platform)
  // console.log(player, platform);

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

    // player.velX = 0;
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

// testing

initImages();
animate();
