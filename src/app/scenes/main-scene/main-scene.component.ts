import {Component, ElementRef, Injectable} from '@angular/core';
import Phaser from 'phaser';
import {SocketClientState, WebsocketService} from '../../websocket/websocket.service';
import {Router} from "@angular/router";
import {Player} from "../../model/Player";
import {Subscription} from "rxjs";
import StaticGroup = Phaser.Physics.Arcade.StaticGroup;

@Component({
    selector: 'app-main-scene',
    templateUrl: './main-scene.component.html',
    styleUrls: ['./main-scene.component.css']
})
@Injectable({
    providedIn: 'root',
})
export class MainSceneComponent extends Phaser.Scene {
    private board: Phaser.Tilemaps.Tilemap;

    private pathLayer: Phaser.Tilemaps.DynamicTilemapLayer;
    private backgroundLayer: Phaser.Tilemaps.DynamicTilemapLayer;
    private coinLayer: Phaser.Types.Tilemaps.TiledObject[];

    private pacmanObjects: Phaser.Tilemaps.Tileset;
    private coin: Phaser.Tilemaps.Tileset;

    private exitButton: Phaser.GameObjects.Image;
    private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;

    private players: Map<string, any> = new Map<string, Player>();
    private monsters: Map<number, Phaser.GameObjects.Sprite> = new Map<number, Phaser.GameObjects.Sprite>();
    private myPlayerName: string;

    private startSendingPlayerPosition = false;

    private subscription1: Subscription;
    private subscription2: Subscription;
    private subscription3: Subscription;
    private subscription4: Subscription;
    private subscription5: Subscription;
    private subscription6: Subscription;

    private coins: StaticGroup;
    private scoreText: any;

    constructor(private websocketService: WebsocketService, private router: Router, private elementRef: ElementRef) {
        super({key: 'main'});

        if (this.router.getCurrentNavigation().extras.state) {
            this.myPlayerName = this.router.getCurrentNavigation().extras.state.nick;
        } else {
            this.router.navigate(['home']);
        }
    }

    startGame() {
        this.websocketService.initializeWebSocketConnection();

        this.subscription2 = this.websocketService.getState().subscribe(state => {
            if (state === SocketClientState.CONNECTED) {
                this.subscription1 = this.websocketService.getIfJoinGame().subscribe((currentCoinPosition) => {
                    if (currentCoinPosition.length > 0) {
                        for (const coinPosition of currentCoinPosition) {
                            this.coins.create(coinPosition.positionX + 16, coinPosition.positionY - 16, "coin")
                        }
                        this.websocketService.addPlayer(this.myPlayerName);
                    } else if (currentCoinPosition.length === 0) {
                        document.getElementsByTagName('canvas').item(0).remove();
                        this.router.navigate(['home'], {state: {nick: this.myPlayerName}});
                        console.error('Juz taki nick istnieje nie mozna dolaczyc!');
                    }
                })
                this.websocketService.joinToGame(this.myPlayerName);
                console.error('Nawiazalem polaczenie websocket i dodalem uzytkownika!');
            } else if (state === SocketClientState.ERROR) {
                console.error('Nie udalo sie nawiazac polaczenia websocket z serwerem!');
                this.cleanAndBackToHomePage();
            } else {
                console.error('Probuje nawiazac polaczenie!')
            }
        })
    }

    create() {
        this.startGame();

        this.websocketService.getUpdateMap().subscribe((updateCommand) => {
            this.coinLayer.forEach(object => {
                let obj = this.coins.create(object.x + 16, object.y - 16, "coin");
                obj.setScale(object.width / 32, object.height / 32);
                obj.body.width = object.width;
                obj.body.height = object.height;
            });
        })

        this.managePlayersInGame();
        this.manageMonstersInGame();

        console.error('Create Board');
        this.game.loop.targetFps = 5
        this.physics.world.setFPS(15)
        console.error(this.game.loop.actualFps);
        this.createAnimationsBySpriteKey('my-player', 'myLeft', 'myRight', 'myDown', 'myUp');
        this.createAnimationsBySpriteKey('other-player', 'enemyLeft', 'enemyRight', 'enemyDown', 'enemyUp');
        this.anims.create({
            key: 'animation',
            frames: this.anims.generateFrameNumbers('monster', {frames: [0, 7]}),
            frameRate: 2,
            repeat: -1
        });


        this.board = this.add.tilemap('board');

        this.pacmanObjects = this.board.addTilesetImage('pacman-elements');
        this.coin = this.board.addTilesetImage('coin');

        this.pathLayer = this.board.createDynamicLayer('path', [this.pacmanObjects], 0, 0);
        this.backgroundLayer = this.board.createDynamicLayer('background_main', [this.pacmanObjects], 0, 0);
        this.coinLayer = this.board.getObjectLayer('objectLayer')['objects'];

        this.exitButton = this.add.image(this.game.canvas.width - 48, 48, 'exit-button');
        this.exitButton.setInteractive();
        this.exitButton.on('pointerup', () => {
            this.switchScene();
        });

        this.cursorKeys = this.input.keyboard.createCursorKeys();

        // this.game.camera.follow(this.players.get(this.myPlayerName));
        // const camera = new Camera(50,50,200,200);
        // // this.cameras.add(camera,true);
        // camera.startFollow(this.players.get(this.myPlayerName));

        this.coins = this.physics.add.staticGroup()

        console.error('Completed Board');
    }

    preload() {
        this.load.image('pacman-elements', 'assets/main/images/pacmanObjects.png');
        this.load.image('coin', 'assets/main/images/coin.png');

        this.load.image('exit-button', 'assets/main/images/exit-button.png');

        this.load.spritesheet('my-player', 'assets/main/images/my-player.png', {frameWidth: 32, frameHeight: 32});
        this.load.spritesheet('other-player', 'assets/main/images/enemie.png', {frameWidth: 32, frameHeight: 32});
        this.load.spritesheet('monster', 'assets/main/images/monster.png', {frameWidth: 32, frameHeight: 32});

        this.load.tilemapTiledJSON('board', 'assets/main/map/board.json');
    }

    update() {
        console.log('PETLA GRA');
        if (this.startSendingPlayerPosition) {
            this.movePlayerManager();
        }
    }

    collectCoin(player: Player, coin) {
        coin.destroy(coin.x, coin.y);
        return false;
    }

    managePlayersInGame() {
        this.subscription3 = this.websocketService.getPlayersToAdd().subscribe((playersToAdd: Array<Player>) => {
            console.error('Nazywam sie: ' + this.myPlayerName);

            for (const player of playersToAdd) {
                if (!this.players.has(player.nickname)) {
                    if (player.nickname !== this.myPlayerName) {
                        this.players.set(player.nickname, new Player(this.load.scene, player.positionX, player.positionY, 'other-player',  player.score));
                        this.physics.add.overlap(this.players.get(player.nickname), this.coins, this.collectCoin, null, this);
                    } else {
                        this.players.set(player.nickname, new Player(this.load.scene, player.positionX, player.positionY, 'my-player', player.score));
                        this.physics.add.overlap(this.players.get(player.nickname), this.coins, this.collectCoin, null, this);

                        this.startSendingPlayerPosition = true;
                        this.scoreText = this.add.text(32, 32, this.myPlayerName + " wynik: " + player.score, {
                            font: "65px Arial",
                            fill: "#ff0044",
                            align: "center"
                        });
                    }
                }
            }
        });

        this.subscription4 = this.websocketService.getPlayerToRemove().subscribe((playerToRemove: Player) => {
            if (playerToRemove.nickname === this.myPlayerName) {
                this.cleanAndBackToHomePage();
            }
            this.players.get(playerToRemove.nickname).destroy(true);
            this.players.delete(playerToRemove.nickname);
        });

        this.subscription5 = this.websocketService.getPlayerToUpdate().subscribe((player) => {
            this.changeAnimationFrameForOtherPlayers(player);
            this.players.get(player.nickname).x = player.positionX;
            this.players.get(player.nickname).y = player.positionY;
            this.players.get(player.nickname).score = player.score;
            this.scoreText.setText(this.myPlayerName + " wynik: " + this.players.get(this.myPlayerName).score)
        })
    }

    movePlayerManager() {
        if (this.cursorKeys.left.isDown === true) {
            this.websocketService.sendPosition(this.players.get(this.myPlayerName).x - 32, this.players.get(this.myPlayerName).y, this.myPlayerName, this.players.get(this.myPlayerName).score);
            if (this.players.get(this.myPlayerName).anims.getCurrentKey() !== 'myLeft') {
                this.players.get(this.myPlayerName).anims.play('myLeft')
            }
        } else if (this.cursorKeys.right.isDown === true) {
            this.websocketService.sendPosition(this.players.get(this.myPlayerName).x + 32, this.players.get(this.myPlayerName).y, this.myPlayerName, this.players.get(this.myPlayerName).score);
            if (this.players.get(this.myPlayerName).anims.getCurrentKey() !== 'myRight') {
                this.players.get(this.myPlayerName).anims.play('myRight')
            }
        } else if (this.cursorKeys.up.isDown === true) {
            this.websocketService.sendPosition(this.players.get(this.myPlayerName).x, this.players.get(this.myPlayerName).y - 32, this.myPlayerName, this.players.get(this.myPlayerName).score);
            if (this.players.get(this.myPlayerName).anims.getCurrentKey() !== 'myUp') {
                this.players.get(this.myPlayerName).anims.play('myUp')
            }
        } else if (this.cursorKeys.down.isDown === true) {
            this.websocketService.sendPosition(this.players.get(this.myPlayerName).x, this.players.get(this.myPlayerName).y + 32, this.myPlayerName, this.players.get(this.myPlayerName).score);
            if (this.players.get(this.myPlayerName).anims.getCurrentKey() !== 'myDown') {
                this.players.get(this.myPlayerName).anims.play('myDown')
            }
        }
    }

    manageMonstersInGame() {
        this.subscription6 = this.websocketService.getMonsterToUpdate().subscribe((monsterToUpdate) => {
            if (this.monsters.has(monsterToUpdate.id)) {
                this.monsters.get(monsterToUpdate.id).x = monsterToUpdate.positionX;
                this.monsters.get(monsterToUpdate.id).y = monsterToUpdate.positionY;
            } else {
                this.monsters.set(monsterToUpdate.id, this.physics.add.sprite(monsterToUpdate.positionX, monsterToUpdate.positionY, 'monster'));
                this.monsters.get(monsterToUpdate.id).anims.play('animation')
            }
        })
    }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    switchScene() {
        this.cleanAndBackToHomePage();
    }

    cleanAndBackToHomePage() {
        this.startSendingPlayerPosition = false;
        this.myPlayerName = '';
        this.router.navigate(['home']);
    }

    ngOnDestroy() {
        if (this.subscription1 != null) {
            console.error('OnDestory')
            this.subscription1.unsubscribe();
            this.subscription2.unsubscribe();
            this.subscription3.unsubscribe();
            this.subscription4.unsubscribe();
            this.subscription5.unsubscribe();
            this.subscription6.unsubscribe();
            this.websocketService.disconnect();
        }
        if (this.game != null) {
            this.game.destroy(true);
            this.game.scene.remove('main');
        }
        if (document.getElementsByTagName('canvas').item(0) != null) {
            document.getElementsByTagName('canvas').item(0).remove();
        }
        this.elementRef.nativeElement.remove();
    }

    createAnimationsBySpriteKey(figureKey: string, left: string, right: string, down: string, up: string) {
        this.anims.create({
            key: left,
            frames: this.anims.generateFrameNumbers(figureKey, {frames: [2, 0]}),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: up,
            frames: this.anims.generateFrameNumbers(figureKey, {frames: [3, 1]}),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: down,
            frames: this.anims.generateFrameNumbers(figureKey, {frames: [7, 5]}),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: right,
            frames: this.anims.generateFrameNumbers(figureKey, {frames: [6, 4]}),
            frameRate: 10,
            repeat: -1
        });
    }

    changeAnimationFrameForOtherPlayers(playerToUpdate) {
        if (this.myPlayerName !== playerToUpdate.nickname) {
            if (this.players.get(playerToUpdate.nickname).x < playerToUpdate.positionX) {
                if (this.players.get(playerToUpdate.nickname).anims.getCurrentKey() !== 'enemyRight') {
                    this.players.get(playerToUpdate.nickname).anims.play('enemyRight')
                }
            }
            if (this.players.get(playerToUpdate.nickname).x > playerToUpdate.positionX) {
                if (this.players.get(playerToUpdate.nickname).anims.getCurrentKey() !== 'enemyLeft') {
                    this.players.get(playerToUpdate.nickname).anims.play('enemyLeft')
                }
            }
            if (this.players.get(playerToUpdate.nickname).y < playerToUpdate.positionY) {
                if (this.players.get(playerToUpdate.nickname).anims.getCurrentKey() !== 'enemyDown') {
                    this.players.get(playerToUpdate.nickname).anims.play('enemyDown')
                }
            }
            if (this.players.get(playerToUpdate.nickname).y > playerToUpdate.positionY) {
                if (this.players.get(playerToUpdate.nickname).anims.getCurrentKey() !== 'enemyUp') {
                    this.players.get(playerToUpdate.nickname).anims.play('enemyUp')
                }
            }
        }
    }
}
