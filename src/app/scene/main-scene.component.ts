import {Component, Injectable, Renderer2} from '@angular/core';
import Phaser from 'phaser';
import {Router} from "@angular/router";
import {Player} from "../model/Player";
import {interval, Observable, Subscription} from "rxjs";
import {DownloadService} from "../downloader/download.service";
import Group = Phaser.Physics.Arcade.Group;
import {Communicator} from "../communication/Communicator";
import {Direction} from "../communication/Direction";
import {SocketClientState} from "../communication/SocketClientState";
import {RequestCacheService} from "../cache/request-cache.service";
import {Request} from "../model/Request";
import {AdditionalData} from "../communication/simulation/data/AdditionalData";
import {environment} from "../../environments/environment";

@Component({
    selector: 'app-main-scene',
    providers: [
        {
            provide: Communicator,
            useClass: environment.serviceToCommunication
        }
    ],
    templateUrl: './main-scene.component.html',
    styleUrls: ['./main-scene.component.css']
})
@Injectable({
    providedIn: 'root',
})
export class MainSceneComponent extends Phaser.Scene {
    // Additional data for testing changing data size
    private readonly arrayWithAdditionalData: Array<AdditionalData>;
    private numberOfAdditionalObjectsPerSecond;

    // Sending message frequency
    private readonly SENDING_SPEED: number;

    // Phaser 3 objects
    private board: Phaser.Tilemaps.Tilemap;

    private pathLayer: Phaser.Tilemaps.DynamicTilemapLayer;
    private _backgroundLayer: Phaser.Tilemaps.DynamicTilemapLayer;
    private coinLayer: Phaser.Types.Tilemaps.TiledObject[];

    private pacmanObjects: Phaser.Tilemaps.Tileset;
    private coin: Phaser.Tilemaps.Tileset;

    private exitButton: Phaser.GameObjects.Image;
    private downloadButton: Phaser.GameObjects.Image;
    private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;

    private coins: Group;

    // Subscriptions
    ifJoinToGameSubscription?: Subscription;
    stateSubscription?: Subscription;
    playersToAddSubscription?: Subscription;
    playerToRemoveSubscription?: Subscription;
    playerToUpdateSubscription?: Subscription;
    monsterToUpdateSubscription?: Subscription;
    positionSenderSubscription?: Subscription;
    coinToGetSubscription?: Subscription;
    updateScoreSubscription?: Subscription;
    refreshCoinsSubscription?: Subscription;
    subscriptionUpdateTop3?: Subscription;

    // Game objects
    private players: Map<string, any> = new Map<string, Player>();
    private monsters: Map<number, Phaser.GameObjects.Sprite> = new Map<number, Phaser.GameObjects.Sprite>();
    private rank = new Array<Player>();
    private myPlayerName: string;

    // Sending objects
    private startSendingPlayerPosition = false;

    private positionSender: Observable<number>;
    private lastX: number;
    private lastY: number;
    private lastAngle: number;
    private counterRequest: number = 0;

    // Score table objects
    private yourScore: any;
    private scoreRanking: Map<string, any> = new Map<string, any>();
    private scoreNumber1: any;
    private scoreNumber2: any;
    private scoreNumber3: any;

    constructor(
        private websocketService: Communicator,
        private router: Router,
        private renderer: Renderer2,
        private downloadService: DownloadService,
        private requestCache: RequestCacheService
    ) {
        super({key: 'main'});

        if (this.router.getCurrentNavigation().extras.state) {
            this.myPlayerName = this.router.getCurrentNavigation().extras.state.nick;
            this.SENDING_SPEED = this.router.getCurrentNavigation().extras.state.speed;
            this.websocketService.myNickname = this.myPlayerName;
            this.websocketService.serverUrl = this.router.getCurrentNavigation().extras.state.serverUrl;
            this.websocketService.formatter = this.router.getCurrentNavigation().extras.state.formatter;
            this.numberOfAdditionalObjectsPerSecond =  Number(this.router.getCurrentNavigation().extras.state.additionalObjects);
            this.arrayWithAdditionalData = new Array<AdditionalData>(
                Number(this.router.getCurrentNavigation().extras.state.additionalObjects)
            );
        } else {
            this.router.navigate(['home']);
        }
    }

    startGame() {
        this.websocketService.initializeConnection();

        // for (let i = 0; i < this.arrayWithAdditionalData.length; i++) {
        //     this.arrayWithAdditionalData[i] = new AdditionalData(this.getRandomInt(20000, 99999), this.getRandomInt(20000, 99999), this.getRandomInt(20000, 99999),
        //         this.randomString(20, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'));
        // }

        this.stateSubscription = this.websocketService.getState().subscribe(state => {
            if (state === SocketClientState.CONNECTED) {
                this.ifJoinToGameSubscription = this.websocketService.getIfJoinGame().subscribe((currentCoinPosition) => {
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
                this.notifyAboutError('Błąd: Brak połaczenia z serwerem');
            } else {
                console.error('Probuje nawiazac polaczenie!')
            }
        })
    }

    create() {
        this.startGame();

        const updateTop3 = interval(1000);
        this.subscriptionUpdateTop3 = updateTop3.subscribe(() => {
            this.checkRanking();
        });

        // Jeszcze trzeba zaimplementowac
        this.coinToGetSubscription = this.websocketService.getCoinToGet().subscribe((coinToCollect) => {
        });

        this.updateScoreSubscription = this.websocketService.getUpdateScore().subscribe((myScore) => {
            this.players.get(this.myPlayerName).score = myScore;
            this.yourScore.setText(this.myPlayerName + " score: " + myScore);
        });

        this.refreshCoinsSubscription = this.websocketService.getRefreshCoins().subscribe(() => {
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
            this.downloadService.downloadResponseMeasurements();
        });

        // Dodanie kolizji dla elementow warstwy background o id od 150 do 250 (te id znajduja sie w tileset ktory sklada sie na te warstwe)
        this._backgroundLayer.setCollisionBetween(140, 250);

        this.cursorKeys = this.input.keyboard.createCursorKeys();

        this.coins = this.physics.add.group();

        this.scoreNumber1 = this.add.text(700, 32, '-', {
            font: "30px Arial",
            fill: "#0022ff",
            align: "center"
        });
        this.scoreNumber2 = this.add.text(1100, 32, '-', {
            font: "30px Arial",
            fill: "#0022ff",
            align: "center"
        });
        this.scoreNumber3 = this.add.text(400, 32, '-', {
            font: "30px Arial",
            fill: "#0022ff",
            align: "center"
        });

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
        if (this.startSendingPlayerPosition) {
            this.movePlayerManager();
        }
    }

    collectCoin(player: Player, coin) {
        coin.destroy(coin.x, coin.y);
        return false;
    }

    managePlayersInGame() {
        this.playersToAddSubscription = this.websocketService.getPlayersToAdd().subscribe((playersToAdd: Array<Player>) => {
            playersToAdd.sort((a, b) => {
                return b.score - a.score
            });

            this.rank.length = 4;
            this.scoreNumber1.setText("NO_ONE");
            this.scoreNumber2.setText("NO_ONE");
            this.scoreNumber3.setText("NO_ONE");
            let counter = 0;
            for (const player of playersToAdd) {
                counter++;
                if (counter < 4) {
                    this.rank[counter - 1] = player
                    this.setScoreText(counter, player);
                }

                if (!this.players.has(player.nickname)) {
                    if (player.nickname !== this.myPlayerName) {
                        this.players.set(player.nickname, new Player(this, player.positionX, player.positionY, 'other-player', player.score, -1));
                        console.error('Dodaje gracza ' + player.nickname)
                        this.players.get(player.nickname).anims.play('enemyAnim');
                    } else {
                        this.players.set(player.nickname, new Player(this, player.positionX, player.positionY, 'my-player', player.score, -1));
                        this.startSendingPlayerPosition = true;
                        this.yourScore = this.add.text(32, 32, this.myPlayerName + " score: " + player.score, {
                            font: "30px Arial",
                            fill: "#ff0044",
                            align: "center"
                        });

                        // Uruchomienie animacji wczesniej przygotowanej
                        this.players.get(player.nickname).anims.play('myAnim');
                        this.requestCache.lastCorrectRequest = new Request(0, player.positionX, player.positionY);
                        this.requestCache.timeForStartCommunication = new Date().getTime();
                        this.sendPlayerPosition();
                    }
                    this.physics.add.overlap(this.players.get(player.nickname), this.coins, this.collectCoin, null, this);
                }
            }
        });

        this.playerToRemoveSubscription = this.websocketService.getPlayerToRemove().subscribe((playerToRemove: Player) => {
            this.rank = this.rank.filter(item => item.nickname !== playerToRemove.nickname);

            if (playerToRemove.nickname === this.myPlayerName) {
                this.cleanAndBackToHomePage();
            }
            this.players.get(playerToRemove.nickname).destroy(true);
            this.players.delete(playerToRemove.nickname);
        });

        this.playerToUpdateSubscription = this.websocketService.getPlayerToUpdate().subscribe((player) => {
            let currentPlayer: Player = this.players.get(player.nickname);

            if (currentPlayer) {
                this.changeAnimationFrameForOtherPlayers(player, currentPlayer);
                if (currentPlayer.version <= player.version) {
                    currentPlayer.x = player.positionX;
                    currentPlayer.y = player.positionY;
                    currentPlayer.score = player.score;
                    currentPlayer.version = player.version;
                }
            }
        })
    }

    sendPlayerPosition() {
        // const player = this.players.get(this.myPlayerName);
        // this.lastX = player.x;
        // this.lastY = player.y;
        // this.lastAngle = player.angle;

        const supplier = interval(1000);
        supplier.subscribe(() => {
            for (let i = 0; i < this.numberOfAdditionalObjectsPerSecond; i++) {
                this.arrayWithAdditionalData.push(new AdditionalData(this.getRandomInt(20000,99999),this.getRandomInt(20000,99999),this.getRandomInt(20000,99999),
                    this.randomString(20, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ')));
            }
        });


        this.positionSender = interval(this.SENDING_SPEED);
        this.positionSenderSubscription = this.positionSender.subscribe(() => {
            const player: Player = this.players.get(this.myPlayerName);
            // if ((this.lastX !== player.x) ||
            //     (this.lastY !== player.y) ||
            //     (this.lastAngle !== player.angle)) {
            //
            //     this.lastX = player.x;
            //     this.lastY = player.y;
            //     this.lastAngle = player.angle;

            this.requestCache.addRequest(++this.counterRequest, player.x, player.y);

            this.websocketService.sendPosition({
                "nickname": this.myPlayerName,
                "positionX": player.x,
                "positionY": player.y,
                "score": player.score,
                "stepDirection": this.getDirection(),
                "version": this.counterRequest,
                "additionalData": this.arrayWithAdditionalData
            });
            // }
        });
    }

    randomString(length, chars) {
        let result = '';
        for (let i = length; i > 0; --i) {
            result += chars[Math.floor(Math.random() * chars.length)];
        }
        return result;
    }

    getRandomInt(min, max) {
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min)) + min;
    }

    setScoreText(number, player) {
        switch (number) {
            case 1: {
                this.scoreNumber1.setText(player.nickname + " score: " + player.score);
                this.scoreRanking.set(player.nickname, this.scoreNumber1);
                this.scoreNumber2.setText("-");
                this.scoreNumber3.setText("-");
                break;
            }
            case 2: {
                this.scoreNumber2.setText(player.nickname + " score: " + player.score);
                this.scoreRanking.set(player.nickname, this.scoreNumber2);
                this.scoreNumber3.setText("-");
                break;
            }
            case 3: {
                this.scoreNumber3.setText(player.nickname + " score: " + player.score);
                this.scoreRanking.set(player.nickname, this.scoreNumber3);
                break;
            }
        }
    }

    checkRanking() {
        let playersArray = new Array<Player>();
        this.players.forEach((value: Player, key: string) => {
            value.nickname = key;
            playersArray.push(value);
        });

        playersArray = playersArray.sort((a, b) => b.score - a.score);

        let counter = 1
        playersArray.forEach(element => {
            this.setScoreText(counter, element);
            counter++;
            if (counter > 3) {
                return;
            }
        })
    }

    movePlayerManager() {
        if (this.cursorKeys.left.isDown === true) {
            this.players.get(this.myPlayerName).setVelocity(-Player.SPEED, 0);
            this.players.get(this.myPlayerName).setAngle(270);
        } else if (this.cursorKeys.right.isDown === true) {
            this.players.get(this.myPlayerName).setVelocity(Player.SPEED, 0);
            this.players.get(this.myPlayerName).setAngle(90);
        } else if (this.cursorKeys.up.isDown === true) {
            this.players.get(this.myPlayerName).setVelocity(0, -Player.SPEED);
            this.players.get(this.myPlayerName).setAngle(0);
        } else if (this.cursorKeys.down.isDown === true) {
            this.players.get(this.myPlayerName).setVelocity(0, Player.SPEED);
            this.players.get(this.myPlayerName).setAngle(180);
        }
    }

    manageMonstersInGame() {
        this.monsterToUpdateSubscription = this.websocketService.getMonsterToUpdate().subscribe((monsterToUpdate) => {
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
    createAnimationsBySpriteKey(figureKey: string, animKey: string) {
        this.anims.create({
            key: animKey,
            frames: this.anims.generateFrameNumbers(figureKey, {frames: [3, 1]}),
            frameRate: 5,
            repeat: -1
        });
    }

    changeAnimationFrameForOtherPlayers(playerToUpdate: Player, currentPlayer: Player) {
        if (this.myPlayerName !== playerToUpdate.nickname) {
            if (currentPlayer.x < playerToUpdate.positionX) {
                currentPlayer.setAngle(90);
            }
            if (currentPlayer.x > playerToUpdate.positionX) {
                currentPlayer.setAngle(270);
            }
            if (currentPlayer.y < playerToUpdate.positionY) {
                currentPlayer.setAngle(0);
            }
            if (currentPlayer.y > playerToUpdate.positionY) {
                currentPlayer.setAngle(180);
            }
        }
    }

    getDirection() {
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

    get backgroundLayer(): Phaser.Tilemaps.DynamicTilemapLayer {
        return this._backgroundLayer;
    }

    ////////////////////////////////////            Cleaning operations             ////////////////////////////////////////////////

    switchScene() {
        this.cleanAndBackToHomePage();
    }

    cleanAndBackToHomePage() {
        this.startSendingPlayerPosition = false;
        this.myPlayerName = '';
        this.router.navigate(['home'], {});
    }

    notifyAboutError(errorMessage) {
        this.router.navigate(['home'], {state: {message: errorMessage}});
    }

    ngOnDestroy() {
        if (this.ifJoinToGameSubscription && this.stateSubscription &&
            this.playersToAddSubscription && this.playerToRemoveSubscription &&
            this.playerToUpdateSubscription && this.monsterToUpdateSubscription &&
            this.positionSenderSubscription && this.coinToGetSubscription &&
            this.updateScoreSubscription && this.refreshCoinsSubscription &&
            this.subscriptionUpdateTop3
        ) {
            console.error('OnDestory')
            this.counterRequest = 0;
            this.ifJoinToGameSubscription.unsubscribe();
            this.stateSubscription.unsubscribe();
            this.playersToAddSubscription.unsubscribe();
            this.playerToRemoveSubscription.unsubscribe();
            this.playerToUpdateSubscription.unsubscribe();
            this.monsterToUpdateSubscription.unsubscribe();
            this.positionSenderSubscription.unsubscribe();
            this.coinToGetSubscription.unsubscribe();
            this.updateScoreSubscription.unsubscribe();
            this.refreshCoinsSubscription.unsubscribe();
            this.subscriptionUpdateTop3.unsubscribe();
            this.websocketService.disconnect();
        }
        if (this.game) {
            this.game.destroy(true);
            this.game.scene.remove('main');
        }
    }
}
