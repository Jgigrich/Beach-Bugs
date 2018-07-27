// a barrier that keeps the player from winning until turned off
const fence = {
    isOn: true,
  render: function (){
            if(this.isOn) {
              let opacity = Math.random()*0.7 + 0.3;
              ctx.fillStyle = `rgba(255, 0, 0, ${opacity}`;
              ctx.fillRect(0, 130, 505, 6);
            }
          }
};

// Enemies our player must avoid
var Enemy = function(x, y, speed) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.sprite = 'images/enemy-bug.png';
    this.boundingBox = [10, 80, 80, 60]; //collision bounding box [x offset, y offset, width, height]
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
    this.speed = Math.random()*2 + 0.5;
  }
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

Enemy.prototype.collided = function() {
  const e = this.boundingBox;
  const p = player.boundingBox;
  if( this.x+e[0] < player.x+p[0]+p[2] &&
      this.x+e[0]+e[2] > player.x+p[0] &&
      this.y+e[1] < player.y+p[1]+p[3] &&
      this.y+e[1]+e[3] > player.y+p[1]
  ) {return true;}
  return false;
};

Enemy.prototype.collision = function() {
    if(this.collided()) {
      player.reset();
      key1.reset();
      key1.captured = false;
      key1.used = false;
      fence.isOn = true;
    }
};

const Key = function(x, y, speed) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.sprite = 'images/Key.png';
    this.boundingBox = [14, 28, 20, 40]; //collision bounding box [x offset, y offset, width, height]
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
  if(this.x > 500 || this.captured  || this.used) {
    this.x = Math.floor(Math.random()*-200 - 200);
    this.y = 130;
    this.speed = 1;
  }
};

Key.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y, 50, 80);
};

// Key.collision uses the collided method on Enemy to detect a collision
Key.prototype.collision = function() {
    if(Enemy.prototype.collided.call(this)) {
      this.captured = true;
    }
};

// Now write your own player class
// This class requires update() and render() methods
const Player = function() {
  this.x = 200;
  this.y = 430;
  this.speed = 1;
  this.sprite = 'images/char-cat-girl.png';
  this.boundingBox = [24, 60, 54, 76]; //collision bounding box [x offset, y offset, width, height]
  this.keys = []; // stores keyboard key presses
  this.won = false;
};

// Parameter: dt, a time delta between ticks
Player.prototype.update = function(dt) {
  const speed = this.speed * dt * 100;
  if(this.keys[39] || this.keys[68]){this.x += speed;}
  if(this.keys[37] || this.keys[65]){this.x -= speed;}
  if(this.keys[38] || this.keys[87]){this.y -= speed;}
  if(this.keys[40] || this.keys[83]){this.y += speed;}
  this.constrain();
  this.win();
};

Player.prototype.win = function() {
  if(this.y < -9) {
    this.won = true;
    setTimeout(()=>{winner.canRestart = true;}, 1500);
    this.y = -8;
  }
};

//  adapted from http://www.hnldesign.nl/work/code/javascript-limit-integer-min-max/
Player.prototype.constrain = function() {
    let yMin = fence.isOn ? 74 : -10;
    this.x = Math.min(420, Math.max(-16, this.x));
    this.y = Math.min(445, Math.max(yMin, this.y));
};

Player.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

Player.prototype.reset = function() {
  this.x = 200;
  this.y = 430;
};

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
const allEnemies = [];
for(let i=0; i<4; i++) {
  let x = Math.floor(Math.random()*-400 - 200);
  let y = Math.floor(Math.random()*250 + 60);
  let speed = Math.random()*2 + 0.5;
  allEnemies.push(new Enemy(x, y, speed));
}
const key1 = new Key(-100, 130, 1); // create the key
const player = new Player();  // create the player

// The control box to turn off the fence
const control = {
        x: 20,
        y: 480,
   sprite: 'images/Selector.png',
boundingBox: [15, 62, 28, 28],
   render: function() {
             ctx.drawImage(Resources.get(this.sprite), this.x, this.y, 60, 100);
             ctx.fillStyle = '#000';
             ctx.font = '20px Arial';
             ctx.fillText('Fence', 20, 500);
             ctx.fillText('Control', 16, 520);
             this.collision();
           },
collision: function() {
              if(Enemy.prototype.collided.call(this) && key1.captured) {
                fence.isOn = false;
                key1.captured = false;
                key1.used = true;
              }
           }
};

const winner = {
  canRestart: false,
      render: function(){
        ctx.fillStyle = '#fff';
        ctx.fillRect(155,135,200,200);
        ctx.fillStyle = '#000';
        ctx.font = '30px Arial';
        ctx.fillText('Splash!', 205, 180);
        ctx.font = '20px Arial';
        ctx.fillText('You made it!!!', 195, 210);
        ctx.fillText('Press any key', 195, 260);
        ctx.fillText('to play again', 200, 282);
      }
};

function restart() {
  winner.canRestart = false;
  player.won = false;
  player.reset();
  key1.reset();
  key1.used = false;
  fence.isOn = true;
}

// This listens for key presses
document.addEventListener('keydown', function(e) {
    if(player.won && winner.canRestart) {
        restart();
    }
    else {player.keys[e.keyCode] = true;}
});

document.addEventListener('keyup', function(e) {
    player.keys[e.keyCode] = false;
});
