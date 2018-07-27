let fenceOn = true;
function fence() {
    if(fenceOn) {
      let opacity = Math.random()*0.5 + 0.5;
      ctx.fillStyle = `rgba(255, 0, 0, ${opacity}`;
      ctx.fillRect(0, 130, 505, 6);
    }
}

// Enemies our player must avoid
var Enemy = function(x, y, speed) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.sprite = 'images/enemy-bug.png';
    this.bbOffsets = [10, 80, 80, 60]; //collision bounding box offests from x,y  [x,y,w,h]
};

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    this.x += this.speed * dt * 100;
    this.collision();
    this.reset();
};

Enemy.prototype.reset = function() {
  if(this.x > 500) {
    this.x = Math.floor(Math.random()*-200 - 200);
    this.y = Math.floor(Math.random()*250 + 60);
    this.speed = Math.random()*3 + 0.5;
  }
}

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    ctx.strokeStyle = 'red';
    //ctx.strokeRect(this.x+10, this.y+80, 80, 60);  //bounding box  -- temp
};

Enemy.prototype.collided = function() {
  const e = this.bbOffsets;
  const p = player.bbOffsets;
  if( this.x+e[0] < player.x+p[0]+p[2] &&
      this.x+e[0]+e[2] > player.x+p[0] &&
      this.y+e[1] < player.y+p[1]+p[3] &&
      this.y+e[1]+e[3] > player.y+p[1]
  ) {return true;}
  return false;
}

Enemy.prototype.collision = function() {
    if(this.collided()) {
      player.reset();
      key1.reset();
      key1.captured = false;
    }
};

/******** Key is a sub-class of Enemy, even though a key is benificial ********/
const Key = function(x, y, speed) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.sprite = 'images/key.png';
    this.bbOffsets = [14, 28, 20, 40]; //collision bounding box offsets from x,y  [x,y,w,h]
    this.captured = false;
    this.used = false;
};

Key.prototype.update = function(dt) {
    if(this.used) {
      this.x = -100;
      this.speed = 0;
    }
    else if(this.captured) {
      this.x = player.x+26;
      this.y = player.y+60;
    }
    else {
      this.x += this.speed * dt * 100;
      this.collision();
      this.reset();
    }
};

Key.prototype.reset = function() {
  if(this.x > 500 || this.captured) {
    this.x = Math.floor(Math.random()*-200 - 200);
    this.y = 130;
    //this.speed = Math.random()*3 + 0.5;
  }
}

Key.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y, 50, 80);
    ctx.strokeStyle = 'red';
    //ctx.strokeRect(this.x+14, this.y+28, 20, 40);  //bounding box  -- temp
};

// Key.collision uses the collided method on Enemy to detect a collision
Key.prototype.collision = function() {
    if(Enemy.prototype.collided.call(this)) {
      this.captured = true;
    }
};

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
const Player = function(name) {
  this.name = name;
  this.x = 200;
  this.y = 430;
  this.speed = 1;
  this.sprite = 'images/char-cat-girl.png';
  this.bbOffsets = [24, 60, 54, 76]; //collision bounding box offests from x,y  [x,y,w,h]
  this.keys = [];
};

Player.prototype.update = function(dt) {
  const speed = this.speed * dt * 100;
  if(this.keys[39]){this.x += speed;}
  if(this.keys[37]){this.x -= speed;}
  if(this.keys[38]){this.y -= speed;}
  if(this.keys[40]){this.y += speed;}
  this.constrain();
}

//  adapted from http://www.hnldesign.nl/work/code/javascript-limit-integer-min-max/
Player.prototype.constrain = function() {
    let yMin = fenceOn ? 74 : -10;
    this.x = Math.min(420, Math.max(-16, this.x));
    this.y = Math.min(445, Math.max(yMin, this.y));
}

Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
    ctx.strokeStyle = 'red';
    //ctx.strokeRect(this.x+24, this.y+60, 54, 76);  //bounding box  -- temp
};

Player.prototype.reset = function() {
  this.x = 200;
  this.y = 430;
};

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
const allEnemies = [];
for(let i=0; i<3; i++) {
  let x = Math.floor(Math.random()*-400 - 200);
  let y = Math.floor(Math.random()*250 + 60);
  let speed = Math.random()*3 + 0.5;
  allEnemies.push(new Enemy(x, y, speed));
}
const key1 = new Key(-100, 130, 1);
const player = new Player("Jill");

// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
const keys = [];

document.addEventListener('keydown', function(e) {
    player.keys[e.keyCode] = true;
});

document.addEventListener('keyup', function(e) {
    player.keys[e.keyCode] = false;
});

const control = {
        x: 20,
        y: 480,
   sprite: 'images/Selector.png',
bbOffsets: [15, 62, 28, 28],
   render: function() {
             ctx.drawImage(Resources.get(this.sprite), this.x, this.y, 60, 100);
             ctx.fillStyle = '#000';
             ctx.font = '20px Arial';
             ctx.fillText("Fence", 20, 500);
             ctx.fillText("Control", 16, 520);
             this.collision();
           },
collision: function() {
              if(Enemy.prototype.collided.call(this) && key1.captured) {
                fenceOn = false;
                key1.captured = false;
                key1.used = true;
              }
           }
};

/*
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
*/
