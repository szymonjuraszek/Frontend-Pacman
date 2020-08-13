import {Component, ElementRef, Injectable} from '@angular/core';
import Phaser from 'phaser';
import {WebsocketService} from '../../communication/websocket/websocket.service';
import {Router} from "@angular/router";
import {Player} from "../../model/Player";
import {interval, Observable, Subscription} from "rxjs";
import StaticGroup = Phaser.Physics.Arcade.StaticGroup;
import {DownloadService} from "../../downloader/download.service";
import Group = Phaser.Physics.Arcade.Group;
import {Communicator} from "../../communication/Communicator";
import {Direction} from "../../communication/Direction";
import {SocketClientState} from "../../communication/SocketClientState";
import {Http2Service} from "../../communication/http2/http2.service";
import {MeasurementService} from "../../cache/measurement.service";
import {RequestCacheService} from "../../cache/request-cache.service";
import {Request} from "../../model/Request";

@Component({
    selector: 'app-main-scene',
    providers: [
        {
            provide: Communicator,
            useClass: WebsocketService
        }
    ],
    templateUrl: './main-scene.component.html',
    styleUrls: ['./main-scene.component.css']
})
@Injectable({
    providedIn: 'root',
})
export class MainSceneComponent extends Phaser.Scene {
    get backgroundLayer(): Phaser.Tilemaps.DynamicTilemapLayer {
        return this._backgroundLayer;
    }

    private board: Phaser.Tilemaps.Tilemap;

    private pathLayer: Phaser.Tilemaps.DynamicTilemapLayer;
    private _backgroundLayer: Phaser.Tilemaps.DynamicTilemapLayer;
    private coinLayer: Phaser.Types.Tilemaps.TiledObject[];

    private pacmanObjects: Phaser.Tilemaps.Tileset;
    private coin: Phaser.Tilemaps.Tileset;

    private exitButton: Phaser.GameObjects.Image;
    private downloadButton: Phaser.GameObjects.Image;
    private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;

    private players: Map<string, any> = new Map<string, Player>();
    private monsters: Map<number, Phaser.GameObjects.Sprite> = new Map<number, Phaser.GameObjects.Sprite>();
    private rank = new Array<Player>();
    private myPlayerName: string;

    private startSendingPlayerPosition = false;

    private subscription1: Subscription;
    private subscription2: Subscription;
    private subscription3: Subscription;
    private subscription4: Subscription;
    private subscription5: Subscription;
    private subscription6: Subscription;
    private positionSender: Observable<number>;
    private lastX: number;
    private lastY: number;
    private lastAngle: number;
    private counterRequest: number = 0;

    private coins: Group;
    private yourScore: any;
    private scoreRanking: Map<string, any> = new Map<string, any>();
    private scoreNumber1: any;
    private scoreNumber2: any;
    private scoreNumber3: any;

    constructor(
        private websocketService: Communicator,
        private router: Router,
        private elementRef: ElementRef,
        private downloadService: DownloadService,
        private requestCache: RequestCacheService
    ) {
        super({key: 'main'});

        if (this.router.getCurrentNavigation().extras.state) {
            this.myPlayerName = this.router.getCurrentNavigation().extras.state.nick;
        } else {
            this.router.navigate(['home']);
        }
    }

    startGame() {
        this.websocketService.initializeConnection();

        this.subscription2 = this.websocketService.getState().subscribe(state => {
            if (state === SocketClientState.CONNECTED) {
                this.subscription1 = this.websocketService.getIfJoinGame().subscribe((currentCoinPosition) => {
                    if (currentCoinPosition.length > 0) {
                        for (const coinPosition of currentCoinPosition) {
                            this.coins.create((coinPosition.positionX * 32) + 16, (coinPosition.positionY * 32) - 16, "coin", null, true, true);
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

        // Jeszcze trzeba zaimplementowac
        this.websocketService.getCoinToGet().subscribe((coinToCollect) => {
        });

        this.websocketService.getUpdateScore().subscribe((myScore) => {
            this.players.get(this.myPlayerName).score = myScore;
            this.yourScore.setText(this.myPlayerName + " score: " + myScore);
        });

        // Jeszcze trzeba zaimplementowac
        this.websocketService.getRefreshCoins().subscribe(() => {
            this.coinLayer.forEach(object => {
                let obj = this.coins.create(object.x + 16, object.y - 16, "coin");
                obj.setScale(object.width / 32, object.height / 32);
                obj.body.width = object.width;
                obj.body.height = object.height;
            });
        });

        this.managePlayersInGame();
        this.manageMonstersInGame();

        console.error('Create Board');
        this.game.loop.targetFps = 50
        this.physics.world.setFPS(50)
        console.error('---------------- Wyswietlam informacje o grze ---------------');
        console.error('FPS actual: ' + this.game.loop.actualFps);
        console.error('FPS physics.world ' + this.physics.world.fps);
        console.error('---------------------------------------------');

        this.createAnimationsBySpriteKey('my-player', 'myAnim');
        this.createAnimationsBySpriteKey('other-player', 'enemyAnim');
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
        this._backgroundLayer = this.board.createDynamicLayer('background_main', [this.pacmanObjects], 0, 0);
        this.coinLayer = this.board.getObjectLayer('objectLayer')['objects'];

        this.exitButton = this.add.image(this.game.canvas.width - 48, 48, 'exit-button');
        this.exitButton.setInteractive();
        this.exitButton.on('pointerup', () => {
            this.switchScene();
        });

        this.downloadButton = this.add.image(this.game.canvas.width - 208, 48, 'download-button');
        this.downloadButton.setInteractive();
        this.downloadButton.on('pointerup', () => {
            this.downloadService.downloadRequestMeasurements();
            this.downloadService.downloadResponseMeasurements();
        });

        // Dodanie kolizji dla elementow warstwy background o id od 150 do 250 (te id znajduja sie w tileset ktory sklada sie na te warstwe)
        this._backgroundLayer.setCollisionBetween(140, 250);

        this.cursorKeys = this.input.keyboard.createCursorKeys();

        this.coins = this.physics.add.group();

        // this.scoreNumber1 = this.add.text(800, 32, 'NO_ONE', {
        //     font: "32px Arial",
        //     fill: "#0022ff",
        //     align: "center"
        // });
        // this.scoreNumber2 = this.add.text(1200, 32, 'NO_ONE', {
        //     font: "32px Arial",
        //     fill: "#0022ff",
        //     align: "center"
        // });
        // this.scoreNumber3 = this.add.text(400, 32, 'NO_ONE', {
        //     font: "32px Arial",
        //     fill: "#0022ff",
        //     align: "center"
        // });

        this.coins.removeCallback = function () {
            console.error('Remove callback')
        }


        console.error('Completed Board');
    }

    preload() {
        this.load.image('pacman-elements', 'assets/main/images/pacmanObjects.png');
        this.load.image('coin', 'assets/main/images/coin.png');

        this.load.image('exit-button', 'assets/main/images/exit-button.png');
        this.load.image('download-button', 'assets/main/images/download-button.png');

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
            // console.error('Nazywam sie: ' + this.myPlayerName);
            // playersToAdd.sort((a, b) => {
            //     return b.score - a.score
            // });
            //
            // this.rank.length = 4;
            // this.scoreNumber1.setText("NO_ONE");
            // this.scoreNumber2.setText("NO_ONE");
            // this.scoreNumber3.setText("NO_ONE");
            // let counter = 0;
            for (const player of playersToAdd) {
                // counter++;
                // if (counter < 4) {
                //     this.rank[counter - 1] = player
                //     this.setScoreText(counter, player);
                // }

                if (!this.players.has(player.nickname)) {
                    if (player.nickname !== this.myPlayerName) {
                        this.players.set(player.nickname, new Player(this, player.positionX, player.positionY, 'other-player', player.score));
                        console.error('Dodaje gracza ' + player.nickname)
                        this.players.get(player.nickname).anims.play('enemyAnim');
                        // this.players.get(player.nickname).body.immovable = true;
                    } else {
                        this.players.set(player.nickname, new Player(this, player.positionX, player.positionY, 'my-player', player.score));
                        this.websocketService.myNickname = this.myPlayerName;
                        this.startSendingPlayerPosition = true;
                        this.yourScore = this.add.text(32, 32, this.myPlayerName + " score: " + player.score, {
                            font: "50px Arial",
                            fill: "#ff0044",
                            align: "center"
                        });

                        // Uruchomienie animacji wczesniej przygotowanej
                        this.players.get(player.nickname).anims.play('myAnim');
                        this.requestCache.lastCorrectRequest = new Request(0, player.positionX, player.positionY);
                        this.sendPlayerPosition();
                    }
                    this.physics.add.overlap(this.players.get(player.nickname), this.coins, this.collectCoin, null, this);
                }
            }

            // for (const player of playersToAdd) {
            //     if (player.nickname !== this.myPlayerName) {
            //         this.physics.add.collider(this.players.get(this.myPlayerName), this.players.get(player.nickname)
            //             ,(h) => {
            //                 this.players.get(this.myPlayerName).setVelocity(0,0);
            //                 this.players.get(player.nickname).setVelocity(0,0);
            //             });
            //     }
            // }
        });

        this.subscription4 = this.websocketService.getPlayerToRemove().subscribe((playerToRemove: Player) => {
            this.rank = this.rank.filter(item => item.nickname !== playerToRemove.nickname);
            console.error("Po srpawdzeniu rankingu")
            if (playerToRemove.nickname === this.myPlayerName) {
                this.cleanAndBackToHomePage();
            }
            this.players.get(playerToRemove.nickname).destroy(true);
            this.players.delete(playerToRemove.nickname);
        });

        this.subscription5 = this.websocketService.getPlayerToUpdate().subscribe((player) => {
            let currentPlayer: Player = this.players.get(player.nickname);

            if(currentPlayer) {
                this.changeAnimationFrameForOtherPlayers(player, currentPlayer);

                currentPlayer.x = player.positionX;
                currentPlayer.y = player.positionY;
                currentPlayer.score = player.score;
            }

            // currentPlayer.score = player.score;
            // console.error(currentPlayer.x + "   " + currentPlayer.y);
            // this.checkRanking(player);
        })
    }

    // 50 FPS dla 20 milis
    sendPlayerPosition() {
        const player = this.players.get(this.myPlayerName);
        this.lastX = player.x;
        this.lastY = player.y;
        this.lastAngle = player.angle;

        this.positionSender = interval(20);
        this.positionSender.subscribe(() => {
            const player: Player = this.players.get(this.myPlayerName);
            if ((this.lastX !== player.x) ||
                (this.lastY !== player.y) ||
                (this.lastAngle !== player.angle)) {

                this.lastX = player.x;
                this.lastY = player.y;
                this.lastAngle = player.angle;
            // console.error(player);
            // console.error(player.x);
            // console.error(player.y);
            this.requestCache.addRequest(++this.counterRequest, player.x, player.y);
            this.websocketService.sendPosition(player.x, player.y, this.myPlayerName, player.score, this.getDirection(), this.counterRequest);
            }
        });
    }

    // setScoreText(number, player) {
    //     switch (number) {
    //         case 1: {
    //             this.scoreNumber1.setText(player.nickname + " score: " + player.score);
    //             this.scoreRanking.set(player.nickname, this.scoreNumber1);
    //             this.scoreNumber2.setText("NO_ONE");
    //             this.scoreNumber3.setText("NO_ONE");
    //             break;
    //         }
    //         case 2: {
    //             this.scoreNumber2.setText(player.nickname + " score: " + player.score);
    //             this.scoreRanking.set(player.nickname, this.scoreNumber2);
    //             this.scoreNumber3.setText("NO_ONE");
    //             break;
    //         }
    //         case 3: {
    //             this.scoreNumber3.setText(player.nickname + " score: " + player.score);
    //             this.scoreRanking.set(player.nickname, this.scoreNumber3);
    //             break;
    //         }
    //     }
    // }

    // checkRanking(player) {
    //     this.rank[3] = player;
    //     this.rank.sort((a, b) => b.score - a.score)
    //     this.rank = this.rank.filter((v, i) => this.rank.findIndex(item => item.nickname == v.nickname) === i);
    //
    //     let counter = 1
    //     this.rank.forEach(element => {
    //         this.setScoreText(counter, element);
    //         counter++;
    //     })
    // }

    movePlayerManager() {
        if (this.cursorKeys.left.isDown === true) {
            this.players.get(this.myPlayerName).setVelocity(-Player.SPEED, 0);
            this.players.get(this.myPlayerName).setAngle(270);
            // this.websocketService.sendPosition(this.players.get(this.myPlayerName).x - Player.SPEED, this.players.get(this.myPlayerName).y, this.myPlayerName, this.players.get(this.myPlayerName).score, Direction.HORIZON);
        } else if (this.cursorKeys.right.isDown === true) {
            this.players.get(this.myPlayerName).setVelocity(Player.SPEED, 0);
            this.players.get(this.myPlayerName).setAngle(90);
            // this.websocketService.sendPosition(this.players.get(this.myPlayerName).x + Player.SPEED, this.players.get(this.myPlayerName).y, this.myPlayerName, this.players.get(this.myPlayerName).score, Direction.HORIZON);
        } else if (this.cursorKeys.up.isDown === true) {
            this.players.get(this.myPlayerName).setVelocity(0, -Player.SPEED);
            this.players.get(this.myPlayerName).setAngle(0);
            // this.websocketService.sendPosition(this.players.get(this.myPlayerName).x, this.players.get(this.myPlayerName).y - Player.SPEED, this.myPlayerName, this.players.get(this.myPlayerName).score, Direction.VERTICAL);
        } else if (this.cursorKeys.down.isDown === true) {
            this.players.get(this.myPlayerName).setVelocity(0, Player.SPEED);
            this.players.get(this.myPlayerName).setAngle(180);
            // this.websocketService.sendPosition(this.players.get(this.myPlayerName).x, this.players.get(this.myPlayerName).y + Player.SPEED, this.myPlayerName, this.players.get(this.myPlayerName).score, Direction.VERTICAL);
        }
        // else {
        //     this.players.get(this.myPlayerName).setVelocity(0, 0);
        // }
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
            this.counterRequest = 0;
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

    createAnimationsBySpriteKey(figureKey: string, animKey: string) {
        this.anims.create({
            key: animKey,
            frames: this.anims.generateFrameNumbers(figureKey, {frames: [3, 1]}),
            frameRate: 10,
            repeat: -1
        });
    }

    changeAnimationFrameForOtherPlayers(playerToUpdate: Player, currentPlayer: Player) {
        console.error(playerToUpdate)
        console.error(currentPlayer)
        if (this.myPlayerName !== playerToUpdate.nickname) {
            if (currentPlayer.x < playerToUpdate.positionX) {
                currentPlayer.setAngle(90);
            }
            if (currentPlayer.x > playerToUpdate.positionX) {
                currentPlayer.setAngle(270);
            }
            if (currentPlayer.y < playerToUpdate.positionY) {
                currentPlayer.setAngle(180);
            }
            if (currentPlayer.y > playerToUpdate.positionY) {
                currentPlayer.setAngle(0);
            }
        }
    }

    getDirection() {
        console.error(this.players.get(this.myPlayerName).angle)
        switch (this.players.get(this.myPlayerName).angle) {
            case 90: {
                return Direction.HORIZON;
            }
            case -180: {
                return Direction.VERTICAL;
            }
            case -90: {
                return Direction.HORIZON;
            }
            case 0: {
                return Direction.VERTICAL;
            }
        }
    }

}
