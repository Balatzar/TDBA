var game = new Phaser.Game(500, 400, Phaser.AUTO, '');

var PhaserGame = function() {

    this.bmd = null;

    this.bad = null;

    this.points = {
        'x': [ -50, 128, 256, 384, 450, 550 ],
        'y': [ 240, 240, 240, 240, 240, 240 ]
    };

    this.pi = 0;
    this.path = [];

};

PhaserGame.prototype = {

    init() {

      this.stage.backgroundColor = '#000';

    },

    preload() {
      this.load.image('bad', 'assets/bad.png');
      this.load.image('tower', 'assets/tower.png');
      this.load.image('ground', 'assets/ground.jpg');
    },

    create() {
      this.add.sprite(0, 0, 'ground');

      this.bmd = this.add.bitmapData(this.game.width, this.game.height);
      this.bmd.addToWorld();

      var py = this.points.y;

      for (var i = 0; i < py.length; i++) {
        py[i] = this.rnd.between(32, 432);
      }

      this.plot();

      this.bad = this.add.sprite(0, 0, 'bad');
      this.bad.anchor.set(0.5);

      this.turrets = this.add.group();

      this.input.onDown.add(this.addTurret, this);

    },

    addTurret(event) {
      for (i = 0; i < this.path.length; i += 1) {
        if (event.y < this.path[i].y + 100 && event.y > this.path[i].y - 100 && event.x ===  Math.round(this.path[i].x)) {
          return;
        }
      }

      var otherTurrets = this.turrets.children;

      for (i = 0; i < otherTurrets.length; i += 1) {
        console.log(event)
        console.log(otherTurrets[i].position)
        if (event.x > otherTurrets[i].position.x &&
            event.x < otherTurrets[i].position.x + 100 &&
            event.y > otherTurrets[i].position.y &&
            event.y < otherTurrets[i].position.y + 120) {
          return;
        }
      }

      this.turrets.create(event.x - 50, event.y - 50, 'tower');
    },

    update() {

      this.bad.x = this.path[this.pi].x;
      this.bad.y = this.path[this.pi].y;
      this.bad.rotation = this.path[this.pi].angle;

      this.pi++;

      if (this.pi >= this.path.length) {
        this.pi = 0;
      }

    },

    plot() {

      this.bmd.clear();

      var x = 1 / game.width;
      var ix = 0;

      for (var i = 0; i <= 1; i += x) {
        var px = this.math.bezierInterpolation(this.points.x, i);
        var py = this.math.bezierInterpolation(this.points.y, i);

        this.bmd.rect(px, py, 10, 10, 'rgba(255, 255, 255, 1)');

        var node = { x: px, y: py, angle: 0 };

        if (ix > 0) {
          node.angle = this.math.angleBetweenPoints(this.path[ix - 1], node);
        }

        this.path.push(node);
        ix += 1
      }

    }

};

game.state.add('Game', PhaserGame, true);