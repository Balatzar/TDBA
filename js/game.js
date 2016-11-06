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
      this.load.image('bullet', 'assets/bullet.png');
    },

    create() {
      this.physics.startSystem(Phaser.Physics.ARCADE);

      this.add.sprite(0, 0, 'ground');

      this.bmd = this.add.bitmapData(this.game.width, this.game.height);
      this.bmd.addToWorld();

      var py = this.points.y;

      for (var i = 0; i < py.length; i++) {
        py[i] = this.rnd.between(32, 432);
      }

      this.plot();

      this.createBad();

      this.turrets = this.add.group();
      this.bullets = this.add.group();
      this.bullets.enableBody = true;

      game.physics.arcade.enable([this.bad]);

      this.input.onDown.add(this.addTurret, this);

    },

    createBad() {

      this.bad = this.add.sprite(0, 0, 'bad');
      this.bad.anchor.set(0.5);
      this.bad.enableBody = true;
      this.bad.life = 100;
      this.bad.frozen = false;

    },

    addTurret(event) {
      for (i = 0; i < this.path.length; i += 1) {
        if (event.y < this.path[i].y + 100 && event.y > this.path[i].y - 100 && event.x ===  Math.round(this.path[i].x)) {
          return;
        }
      }

      var otherTurrets = this.turrets.children;

      for (i = 0; i < otherTurrets.length; i += 1) {
        if (event.x > otherTurrets[i].position.x &&
            event.x < otherTurrets[i].position.x + 100 &&
            event.y > otherTurrets[i].position.y &&
            event.y < otherTurrets[i].position.y + 120) {
          return;
        }
      }

      this.turrets.create(event.x - 50, event.y - 50, 'tower');
    },

    shoot(bad, bullet) {
      console.log(this)
      bullet.kill();
      console.log(this.bullets)
      bad.life -= 10;
      if (!bad.life) {
        bad.kill();
        this.bullets.removeChildren();
        return;
      }
      bullet.turret.shooting = false;
    },

    update() {
      var shooting = this.physics.arcade.overlap(this.bad, this.bullets, this.shoot.bind(this));

      if (!this.bad.frozen) {
        this.bad.x = this.path[this.pi].x;
        this.bad.y = this.path[this.pi].y;
        this.bad.rotation = this.path[this.pi].angle;

        this.pi++;
      }

      if (this.pi >= this.path.length) {
        this.pi = 0;
      }

      var turrets = this.turrets.children;
      var bullets = this.bullets.children;

      turrets.forEach(t => {
        if (!t.shooting) {
          t.shooting = true;
          var bullet = this.bullets.create(t.position.x + 50, t.position.y + 50, 'bullet');
          bullet.turret = t;
        }
      });

      bullets.forEach(b => {
        this.physics.arcade.moveToObject(b, this.bad, 200)
      });

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