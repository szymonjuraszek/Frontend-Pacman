import {Component, Injectable} from '@angular/core';
import Phaser from 'phaser';
import Sprite = Phaser.GameObjects.Sprite;
import {WebsocketService} from '../../websocket/websocket.service';
import {Router} from "@angular/router";
import {OAuthService} from "angular-oauth2-oidc";
import {Game} from "../../model/Game";
import {HttpService} from "../../http/http.service";
import {Player} from "../../model/Player";
import List = Phaser.Structs.List;

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

  private layer1: Phaser.Tilemaps.DynamicTilemapLayer;
  private layer2: Phaser.Tilemaps.DynamicTilemapLayer;
  private layer3: Phaser.Tilemaps.DynamicTilemapLayer;
  private layer4: Phaser.Tilemaps.DynamicTilemapLayer;

  private pacmanObjects: Phaser.Tilemaps.Tileset;
  private coin: Phaser.Tilemaps.Tileset;

  private exitButton: Phaser.GameObjects.Image;
  private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;

  private monster1: Phaser.GameObjects.Sprite;
  private monster2: Phaser.GameObjects.Sprite;
  private monster3: Phaser.GameObjects.Sprite;
  private monster4: Phaser.GameObjects.Sprite;

  private counter = 0;

  private players: Map<string,Phaser.GameObjects.Sprite> = new Map<string,Phaser.GameObjects.Sprite>();
  private myPlayerName: string;
  private startSendingPlayerPosition = false;

  constructor(private websocketService: WebsocketService, private router: Router, private oauthService: OAuthService,
              private httpService: HttpService) {
    super({key: 'main'});
  }

  loadDataAboutGames() {
    this.websocketService.initializeWebSocketConnection();
    setTimeout(() => {
      this.httpService.addPlayer().subscribe(data => {
        console.error('Dodalem uzytkownika do gry!');
      });
    }, 3000);
  }

  updatePlayersInGame() {
    this.websocketService.getPlayersToAdd().subscribe((playersToAdd: Array<Player>) => {
      if(!this.myPlayerName) {
        this.myPlayerName = JSON.parse(sessionStorage.getItem('id_token_claims_obj')).email;
      }

      console.error('Nazywam sie: ' + this.myPlayerName);

      for (const player of playersToAdd) {
        if(!this.players.has(player.nickname)) {
          this.players.set(player.nickname, this.physics.add.sprite(player.positionX, player.positionY, 'player'));
        }
      }

      this.startSendingPlayerPosition = true;
    });

    this.websocketService.getPlayerToRemove().subscribe((playerToRemove: Player) => {
      this.players.get(playerToRemove.nickname).destroy(true);
      this.players.delete(playerToRemove.nickname);
    });
  }

  create() {
    this.loadDataAboutGames();
    this.updatePlayersInGame();

    this.websocketService.getPlayerToUpdate().subscribe((player) => {
      this.players.get(player.nickname).x = player.positionX;
      this.players.get(player.nickname).y = player.positionY;
    })

    console.error('Create Board');

    this.board = this.add.tilemap('board');
    console.error(this.board.getTileset('pacman-elements'));
    console.error(this.board.getTileset('pacman-elements').getTileData(1));

    this.monster1 = this.add.sprite(400, 200, 'monster1');
    this.monster2 = this.add.sprite(300, 200, 'monster2');
    this.monster3 = this.add.sprite(200, 600, 'monster3');
    this.monster4 = this.add.sprite(100, 400, 'monster4');

    this.pacmanObjects = this.board.addTilesetImage('pacman-elements');
    this.coin = this.board.addTilesetImage('coin-new');

    this.layer1 = this.board.createDynamicLayer('path', [this.pacmanObjects], 0, 0);
    this.layer2 = this.board.createDynamicLayer('background_main', [this.pacmanObjects], 0, 0);
    this.layer3 = this.board.createDynamicLayer('coins', [this.coin], 0, 0);
    this.layer4 = this.board.createDynamicLayer('figures', [this.pacmanObjects], 0, 0);

    this.exitButton = this.add.image(this.game.canvas.width - 48, 48, 'exit-button');
    this.exitButton.setInteractive();
    this.exitButton.on('pointerup', () => {
      this.switchScene();
    });

    // this.player123 = this.physics.add.sprite(48, 144, 'player');
    this.cursorKeys = this.input.keyboard.createCursorKeys();
    // this.player.setCollideWorldBounds(true);

    // this.layer2.setCollisionBetween(148, 238);
    // this.physics.add.collider(this.player, this.layer2);

    this.anims.create({
      key: 'monster1_anim',
      frames: this.anims.generateFrameNumbers('monster1', {}),
      frameRate: 20,
      repeat: -1
    });
    this.anims.create({
      key: 'monster2_anim',
      frames: this.anims.generateFrameNumbers('monster2', {}),
      frameRate: 20,
      repeat: -1
    });
    this.anims.create({
      key: 'monster3_anim',
      frames: this.anims.generateFrameNumbers('monster3', {}),
      frameRate: 20,
      repeat: -1
    });
    this.anims.create({
      key: 'monster4_anim',
      frames: this.anims.generateFrameNumbers('monster4', {}),
      frameRate: 20,
      repeat: 0
    });

    this.monster1 = this.add.sprite(700, 144, 'monster1');
    this.monster2 = this.add.sprite(600, 144, 'monster2');
    this.monster3 = this.add.sprite(500, 144, 'monster3');
    this.monster4 = this.add.sprite(400, 144, 'monster4');

    this.monster1.play('monster1_anim');
    this.monster2.play('monster2_anim');
    this.monster3.play('monster3_anim');
    this.monster4.play('monster4_anim');

    this.monster1.setInteractive();
    this.monster2.setInteractive();
    this.monster3.setInteractive();
    this.monster4.setInteractive();

    this.physics.add.collider(this.monster1, this.layer2);
    this.physics.add.collider(this.monster2, this.layer2);
    this.physics.add.collider(this.monster3, this.layer2);
    this.physics.add.collider(this.monster4, this.layer2);

    console.error('Completed Board');
  }

  preload() {
    this.load.image('pacman-elements', 'assets/main/images/pacmanObjects.png');
    this.load.image('coin-new', 'assets/main/images/coin.png');

    this.load.image('exit-button', 'assets/main/images/exit-button.png');

    this.load.image('player', 'assets/main/images/player.jpg');
    this.load.image('monster', 'assets/main/images/player.jpg');

    this.load.tilemapTiledJSON('board', 'assets/main/map/board.json');

    this.load.spritesheet('monster1', 'assets/main/images/monster.jpg', {
      frameWidth: 32,
      frameHeight: 32
    });
    this.load.spritesheet('monster2', 'assets/main/images/monster.jpg', {
      frameWidth: 32,
      frameHeight: 32
    });
    this.load.spritesheet('monster3', 'assets/main/images/monster.jpg', {
      frameWidth: 32,
      frameHeight: 32
    });
    this.load.spritesheet('monster4', 'assets/main/images/monster.jpg', {
      frameWidth: 32,
      frameHeight: 32
    });
  }

  private number = 0;

  update() {
    console.log('Scena GRA');
    // this.moveShip(this.monster1, 5);
    // this.moveShip(this.monster2, 7);
    // this.moveShip(this.monster3, 9);
    // this.moveShip(this.monster4, 11);
    // this.number++;
    // console.error(this.number);

    this.counter++;
    if (this.counter > 5 && this.startSendingPlayerPosition) {
      this.movePlayerManager();
      this.counter = 0;
    }
  }

  moveShip(ship: Sprite, speed) {
    if (ship.x < 0) {
      console.error('collide');
      ship.x = 0;
    } else {
      ship.x -= speed;
    }
  }

  movePlayerManager() {
    if (this.cursorKeys.left.isDown === true) {
      this.websocketService.sendPosition(this.players.get(this.myPlayerName).x-32, this.players.get(this.myPlayerName).y , this.myPlayerName);
    } else if (this.cursorKeys.right.isDown === true) {
      this.websocketService.sendPosition(this.players.get(this.myPlayerName).x+32, this.players.get(this.myPlayerName).y, this.myPlayerName);
    } else if (this.cursorKeys.up.isDown === true) {
      this.websocketService.sendPosition(this.players.get(this.myPlayerName).x, this.players.get(this.myPlayerName).y-32, this.myPlayerName);
    } else if (this.cursorKeys.down.isDown === true) {
      this.websocketService.sendPosition(this.players.get(this.myPlayerName).x, this.players.get(this.myPlayerName).y+32, this.myPlayerName);
    }
  }


  switchScene() {
    this.httpService.logout().subscribe((data) => {
        console.error(data);
        this.logout();
        this.game.destroy(true);
        this.game.scene.remove('main');
        document.getElementsByTagName('canvas').item(0).remove();
        this.router.navigate(['home']);
      })

  }

  logout() {
    this.websocketService.disconnect();
    if (sessionStorage.getItem('access_token') && sessionStorage.getItem('access_token')) {
      this.oauthService.logOut();
    }
  }
}
