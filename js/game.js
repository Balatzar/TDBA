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

    this.alive = 0;

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

      for (var i = 0; i < this.points.y.length; i++) {
        this.points.y[i] = this.rnd.between(32, 432);
      }

      this.plot();

      this.createBad();

      this.turrets = this.add.group();
      this.bullets = this.add.group();
      this.bullets.enableBody = true;

      game.physics.arcade.enable([this.bad]);

      this.input.onDown.add(this.addTurret, this);

      this.lives = 10;
      this.livesText = game.add.text(16, 16, `Vies : ${this.lives}`, { fontSize: '32px', fill: '#000' });

    },

    createBad() {

      this.bad = this.add.sprite(0, 0, 'bad');
      this.bad.anchor.set(0.5);
      this.bad.enableBody = true;
      this.bad.life = 100;
      this.bad.frozen = false;

      this.alive += 1;

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
      bullet.kill();
      bad.life -= 10;
      if (!bad.life) {
        bad.kill();
        this.alive -= 1;
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
        this.lives -= 1;
        this.livesText.text = `Vies : ${this.lives}`;
        this.pi = 0;
      }

      var turrets = this.turrets.children;
      var bullets = this.bullets.children;
      console.log(this.alive)

      turrets.forEach(t => {
        if (!t.shooting && this.alive) {
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

      var x = 1 / game.width;
      var j = 0;

      for (var i = 0; i <= 1; i += x) {
        var px = this.math.bezierInterpolation(this.points.x, i);
        var py = this.math.bezierInterpolation(this.points.y, i);

        this.bmd.rect(px, py, 10, 10, 'rgba(255, 255, 255, 1)');

        var node = { x: px, y: py, angle: 0 };

        if (j > 0) {
          node.angle = this.math.angleBetweenPoints(this.path[j - 1], node);
        }

        this.path.push(node);
        j += 1
      }

    }

};

game.state.add('Game', PhaserGame, true);