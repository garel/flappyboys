const configurations = {
    type: Phaser.AUTO,
    width: 576,
    height: 324,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: {
                y: 300
            },
            debug: false
        }
    },
    scene: {
        preload: preload,
        create: create,
        update: update
    }
}

const game = new Phaser.Game(configurations)

const assets = {
    animations: {
        explosion: {
            key: 'explosion-animation',
            asset: 'explosion',
        },
        splash: {
            key: 'splash-animation',
            asset: 'splash',
        }
    },
    background: 'background',
    water: 'water',
    plane: 'plane',
    needle: 'needle',
    gameOver: 'game-over',
    restart: 'restart',
}

let background
let gameOver
let gameOverBanner
let gameStarted
let upButton
let restartButton
let player
let plane
let framesMoveUp
let water
let needle
let counter

function preload()  {
    this.load.image(assets.background, 'assets/background.png')
    this.load.image(assets.water, 'assets/water.png')
    this.load.image(assets.plane, 'assets/plane.png')
    this.load.image(assets.needle, 'assets/spaceneedle.png')
    this.load.image(assets.gameOver, 'assets/gameover.png')
    this.load.image(assets.restart, 'assets/restart-button.png')
    this.load.image('ground', 'assets/ground-sprite.png')

    this.load.spritesheet(
        assets.animations.explosion.asset,
        'assets/explosion.png',
        {
            frameWidth: 64,
            frameHeight: 64
        }
    )

    this.load.spritesheet(
        assets.animations.splash.asset,
        'assets/splash.png',
        {
            frameWidth: 60,
            frameHeight: 30
        }
    )
}

function initSession(scene) {
    scene.physics.resume()
    counter = Phaser.Math.Between(0, 10)
    framesMoveUp = 0
    gameOverBanner.visible = false
    restartButton.visible = false
    gameOver = false
    gameStarted = true
    player = scene.physics.add.sprite(150, 100, assets.plane)
    player.setCollideWorldBounds(true)
    player.body.allowGravity = false
    needle.clear(true, true)

    scene.physics.add.collider(player, water, hitWater, null, scene)
    scene.physics.add.collider(player, needle, hitNeedle, null, scene)
}

function create()  {
    background = this.add.image(0, 0, assets.background).setOrigin(0, 0).setInteractive()

    water = this.physics.add.sprite(configurations.width, 500, assets.water)
    water.setCollideWorldBounds(true)
    water.setDepth(10)

    needle = this.physics.add.group()

    upButton = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)

    this.anims.create({
        key: assets.animations.explosion.key,
        frames: this.anims.generateFrameNumbers(assets.animations.explosion.asset, {
            start: 0,
            end: 19
        }),
        frameRate: 20,
        repeat: 0
    })

    this.anims.create({
        key: assets.animations.splash.key,
        frames: this.anims.generateFrameNumbers(assets.animations.splash.asset, {
            start: 0,
            end: 6
        }),
        frameRate: 10,
        repeat: 0
    })

    gameOverBanner = this.add.image(configurations.width / 2, 106, assets.gameOver)
    gameOverBanner.setDepth(20)
    gameOverBanner.visible = false

    restartButton = this.add.image(configurations.width / 2, 200, assets.restart).setInteractive()
    restartButton.on('pointerdown', () => {
        player.destroy()
        initSession(this)
    })
    restartButton.setDepth(20)
    restartButton.visible = false

    initSession(this)
}

function hitWater(player) {
    this.physics.pause()

    gameOver = true
    gameStarted = false

    player.angle = 0
    player.y += 10

    player.anims.play(assets.animations.splash.key)

    gameOverBanner.visible = true
    restartButton.visible = true
}

function hitNeedle(player) {
    this.physics.pause()

    gameOver = true
    gameStarted = false

    player.angle = 0
    player.y += 10

    player.anims.play(assets.animations.explosion.key)

    gameOverBanner.visible = true
    restartButton.visible = true
}

function update()  {
    if (gameOver)
        return

    if (framesMoveUp > 0)
    {
        framesMoveUp--
        return
    }
    if (Phaser.Input.Keyboard.JustDown(upButton) && counter > 0)
    {
        counter--
        player.setVelocityY(-400)
        player.angle = -15
        framesMoveUp = 5

        return
    }

    player.setVelocityY(120)

    if (player.angle < 90) {
        player.angle += 1
    }

    let childrenCount = 0
    needle.children.iterate(needle => {
        childrenCount++

        if (!needle) return

        if (needle.x < -20)
        {
            childrenCount--
            needle.destroy()
            return
        }

        needle.setVelocityX(-100)
    })

    if (childrenCount < 1)
    {
        currentY = Phaser.Math.Between(150, 250)
        current = needle.create(configurations.width, currentY, assets.needle)
        current.body.allowGravity = false
        current.setDepth(15)
    }
}
