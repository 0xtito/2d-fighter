function Preloader() {
  var gameImages;
  this.images;

  var that = this;

  this.init = function () {
    gameImages = {
      attacks_right_1: `./images/buck_borris/attacks_right.png`,
      attacks_right_2: `./images/buck_borris2/attacks_right.png`,
      attacks_left_1: `./images/buck_borris/attacks_left.png`,
      attacks_left_2: `./images/buck_borris2/attacks_left.png`,
      damaged_right_1: `./images/buck_borris/damaged_right.png`,
      damaged_right_2: `./images/buck_borris2/damaged_right.png`,
      damaged_left_1: `./images/buck_borris/damaged_left.png`,
      damaged_left_2: `./images/buck_borris2/damaged_left.png`,
      run_right_1: `./images/buck_borris/run_right.png`,
      run_right_2: `./images/buck_borris2/run_right.png`,
      run_left_1: `./images/buck_borris/run_left.png`,
      run_left_2: `./images/buck_borris2/run_left.png`,
      jump_right_1: `./images/buck_borris/jump_right.png`,
      jump_right_2: `./images/buck_borris2/jump_right.png`,
      jump_left_1: `./images/buck_borris/jump_left.png`,
      jump_left_2: `./images/buck_borris2/jump_left.png`,
      idle_right_1: `./images/buck_borris/idle_right.png`,
      idle_right_2: `./images/buck_borris2/idle_right.png`,
      idle_left_1: `./images/buck_borris/idle_left.png`,
      idle_left_2: `./images/buck_borris2/idle_left.png`,
    };
    var images = that.loadImages(gameImages);
    return images;
  };

  this.initMainApp = function () {
    console.log("images loaded");
    imagesLoaded = true;
  };

  this.loadImages = function (srcImages) {
    let images = {};
    let loadedImages = 0;
    let totalImages = 0;

    for (let src in srcImages) {
      totalImages++;
    }

    for (let src in srcImages) {
      images[src] = new Image();
      images[src].src = srcImages[src];

      // arrow function
      images[src].onload = () => {
        loadedImages++;

        if (loadedImages >= totalImages) {
          that.initMainApp();
          that.images = images;
        }
      };
    }
  };
}
