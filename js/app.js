// Convenience constants and methods for interacting with coordinates.
// Based on hardcoded values in engine.js.
var ROW_SIZE = 83;
var COLUMN_SIZE = 101;
var row = function(i) {
    // The images for sprites and blocks are not vertically aligned so a small
    // value is subtracted for the y position of a row for sprites.
    return i * ROW_SIZE - 25;
};
var col = function(i) {
    return i * COLUMN_SIZE;
};

// A sprite that can be drawn at a certain position.
var Sprite = function(sprite, x, y) {
    this.sprite = sprite;
    this.x = x;
    this.y = y;
};

// Draws the sprite on the screen.
Sprite.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

// Checks whether two sprites collide.
// Assumes for simplicity that sprites are always fixed to a row.
Sprite.prototype.collides = function(otherSprite) {
    var width = Resources.get(this.sprite).width;
    var otherWidth = Resources.get(otherSprite.sprite).width;
    if (this.y != otherSprite.y) return false;
    if (this.x < otherSprite.x) {
        return this.x + width > otherSprite.x;
    } else {
        return otherSprite.x + otherWidth > this.x;
    }
};

// Enemies the player must avoid.
// The enemies have a certain horizontal speed.
var Enemy = function(x, y, velocity) {
    Sprite.call(this, 'images/enemy-bug.png', x, y);
    this.velocity = velocity;
};
Enemy.prototype = Object.create(Sprite.prototype);

// Updates the enemy's position by multiplying its velocity by the time
// passed since the last update.
Enemy.prototype.update = function(dt) {
    this.x = this.x + this.velocity * dt;
    if (this.x > ctx.canvas.width) {
        this.x -= ctx.canvas.width + COLUMN_SIZE;
    }
};

// The player sprite that has a certain starting position.
var Player = function(startX, startY) {
    Sprite.call(this, 'images/char-boy.png', startX, startY);
    this.startX = startX;
    this.startY = startY;
};
Player.prototype = Object.create(Sprite.prototype);

// Places the player back at the starting position.
Player.prototype.restart = function() {
    this.x = this.startX;
    this.y = this.startY;
};

// Updates the players position by checking if the player needs to be moved
// to the starting position.
Player.prototype.update = function(dt) {
    // Restart when the player collides with an enemy.
    for (var i = 0; i < allEnemies.length; i++) {
        if (this.collides(allEnemies[i])) {
            this.restart();
            return;
        }
    }
    // Restart when the player arrives at the water at row 0.
    if (this.y === row(0)) {
        this.restart();
    }
};

// Move the player in the appropriate direction unless the player is on the
// edge of the field.
Player.prototype.handleInput = function(action) {
    var image = Resources.get(this.sprite);
    switch(action) {
        case 'left':
            if (this.x != col(0)) {
                this.x -= COLUMN_SIZE;
            }
            break;
        case 'up':
            if (this.y != row(0)) {
                this.y -= ROW_SIZE;
            }
            break;
        case 'right':
            if (this.x != col(4)) {
                this.x += COLUMN_SIZE;
            }
            break;
        case 'down':
            if (this.y != row(5)) {
                this.y += ROW_SIZE;
            }
            break;
        default:
            break;
    }
};

// Instantiate player and enemies.
var player = new Player(col(2), row(5));
var allEnemies = [];
allEnemies.push(new Enemy(col(-1), row(1), 100));
allEnemies.push(new Enemy(col(-1), row(2), 150));
allEnemies.push(new Enemy(col(-1), row(3), 200));

// This listens for key presses and sends the keys to the
// Player.handleInput() method.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    player.handleInput(allowedKeys[e.keyCode]);
});
