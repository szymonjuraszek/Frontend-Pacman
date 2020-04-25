import {Component, Injectable} from '@angular/core';
import Phaser from 'phaser';
import {SocketClientState, WebsocketService} from '../../websocket/websocket.service';
import {Router} from "@angular/router";
import {OAuthService} from "angular-oauth2-oidc";
import {HttpService} from "../../http/http.service";
import {Player} from "../../model/Player";

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

  private pacmanObjects: Phaser.Tilemaps.Tileset;
  private coin: Phaser.Tilemaps.Tileset;

  private exitButton: Phaser.GameObjects.Image;
  private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys;

  private players: Map<string, Phaser.GameObjects.Sprite> = new Map<string, Phaser.GameObjects.Sprite>();
  private monsters: Map<number, Phaser.GameObjects.Sprite> = new Map<number, Phaser.GameObjects.Sprite>();
  private myPlayerName: string;

  private startSendingPlayerPosition = false;
  private counter = 0;

  constructor(private websocketService: WebsocketService, private router: Router) {
    super({key: 'main'});
    this.myPlayerName = this.router.getCurrentNavigation().extras.state.nick;
  }

  startGame() {
    this.websocketService.initializeWebSocketConnection();

    this.websocketService.getState().subscribe(state => {
      if (state === SocketClientState.CONNECTED) {
        this.websocketService.getIfJoinGame().subscribe(nickname => {
          console.error(nickname);
          if(this.myPlayerName === nickname) {
            this.cleanAndBackToHomePage();
            console.error('Juz taki nick istnieje nie mozna dolaczyc!');
          }

        })
        this.websocketService.joinGame(this.myPlayerName);
        console.error('Nawiazalem polaczenie websocket i dodalem uzytkownika!');
      } else if (state === SocketClientState.ERROR) {
        console.error('Nie udalo sie nawiazac polaczenia websocket z serwerem!');
        this.cleanAndBackToHomePage();
      } else {
        console.error('Probuje nawiazac polaczenie!')
      }
    })
  }

  managePlayersInGame() {
    this.websocketService.getPlayersToAdd().subscribe((playersToAdd: Array<Player>) => {
      console.error('Nazywam sie: ' + this.myPlayerName);

      for (const player of playersToAdd) {
        if (!this.players.has(player.nickname)) {
          if (player.nickname !== this.myPlayerName) {
            this.players.set(player.nickname, this.physics.add.sprite(player.positionX, player.positionY, 'other-player'));
          } else {
            this.players.set(player.nickname, this.physics.add.sprite(player.positionX, player.positionY, 'my-player'));
          }
        }
      }

      this.startSendingPlayerPosition = true;
    });

    this.websocketService.getPlayerToRemove().subscribe((playerToRemove: Player) => {
      if (playerToRemove.nickname === this.myPlayerName) {
        this.cleanAndBackToHomePage();
      }
      this.players.get(playerToRemove.nickname).destroy(true);
      this.players.delete(playerToRemove.nickname);
    });

    this.websocketService.getPlayerToUpdate().subscribe((player) => {
      this.players.get(player.nickname).x = player.positionX;
      this.players.get(player.nickname).y = player.positionY;
    })
  }

  manageMonstersInGame() {
    this.websocketService.getMonsterToUpdate().subscribe((monsterToUpdate) => {
      if (this.monsters.has(monsterToUpdate.id)) {
        this.monsters.get(monsterToUpdate.id).x = monsterToUpdate.positionX;
        this.monsters.get(monsterToUpdate.id).y = monsterToUpdate.positionY;
      } else {
        this.monsters.set(monsterToUpdate.id, this.physics.add.sprite(monsterToUpdate.positionX, monsterToUpdate.positionY, 'monster'));
      }
    })
  }

  create() {
    this.startGame();

    this.managePlayersInGame();
    this.manageMonstersInGame();

    console.error('Create Board');

    this.board = this.add.tilemap('board');

    this.pacmanObjects = this.board.addTilesetImage('pacman-elements');
    this.coin = this.board.addTilesetImage('coin-new');

    this.layer1 = this.board.createDynamicLayer('path', [this.pacmanObjects], 0, 0);
    this.layer2 = this.board.createDynamicLayer('background_main', [this.pacmanObjects], 0, 0);
    // this.layer3 = this.board.createDynamicLayer('coins', [this.coin], 0, 0);

    this.exitButton = this.add.image(this.game.canvas.width - 48, 48, 'exit-button');
    this.exitButton.setInteractive();
    this.exitButton.on('pointerup', () => {
      this.switchScene();
    });

    this.cursorKeys = this.input.keyboard.createCursorKeys();

    console.error('Completed Board');
  }

  preload() {
    this.load.image('pacman-elements', 'assets/main/images/pacmanObjects.png');
    this.load.image('coin-new', 'assets/main/images/coin.png');

    this.load.image('exit-button', 'assets/main/images/exit-button.png');

    this.load.image('my-player', 'assets/main/images/my_player.jpg');
    this.load.image('other-player', 'assets/main/images/other_player.jpg');
    this.load.image('monster', 'assets/main/images/monster.jpg');

    this.load.tilemapTiledJSON('board', 'assets/main/map/board.json');
  }

  update() {
    console.log('Scena GRA');

    // this.counter++;
    if (this.startSendingPlayerPosition) {
      this.movePlayerManager();
      // this.counter = 0;
    }
  }

  movePlayerManager() {
    if (this.cursorKeys.left.isDown === true) {
      this.websocketService.sendPosition(this.players.get(this.myPlayerName).x - 32, this.players.get(this.myPlayerName).y, this.myPlayerName);
    } else if (this.cursorKeys.right.isDown === true) {
      this.websocketService.sendPosition(this.players.get(this.myPlayerName).x + 32, this.players.get(this.myPlayerName).y, this.myPlayerName);
    } else if (this.cursorKeys.up.isDown === true) {
      this.websocketService.sendPosition(this.players.get(this.myPlayerName).x, this.players.get(this.myPlayerName).y - 32, this.myPlayerName);
    } else if (this.cursorKeys.down.isDown === true) {
      this.websocketService.sendPosition(this.players.get(this.myPlayerName).x, this.players.get(this.myPlayerName).y + 32, this.myPlayerName);
    }
  }

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  switchScene() {
    this.websocketService.quitGame(this.myPlayerName);
    this.websocketService.getExitGame().subscribe(ifRemove => {
      if(ifRemove) {
        console.error('Usunieto poprawnie uzytkownika z gry!')
      }
      this.websocketService.disconnect();
      this.cleanAndBackToHomePage();
    });
  }

  cleanAndBackToHomePage() {
    this.myPlayerName = '';
    this.game.destroy(true);
    this.game.scene.remove('main');
    document.getElementsByTagName('canvas').item(0).remove();
    this.router.navigate(['home']);
  }
}
