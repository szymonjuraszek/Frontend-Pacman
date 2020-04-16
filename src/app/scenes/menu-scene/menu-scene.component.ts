import {Component, Injectable} from '@angular/core';
import {WebsocketService} from '../../websocket/websocket.service';
import Phaser from 'phaser';
import {HttpService} from '../../http/http.service';
import {Game} from '../../model/game';
import {OAuthService} from "angular-oauth2-oidc";
import {Router} from "@angular/router";
import {Subject} from "rxjs";

@Component({
  selector: 'app-menu-scene',
  templateUrl: './menu-scene.component.html',
  styleUrls: ['./menu-scene.component.css'],
})
@Injectable({
  providedIn: 'root',
})
export class MenuSceneComponent extends Phaser.Scene {
  private startButton: Phaser.GameObjects.Image;
  private joinButtons: Array<Phaser.GameObjects.Image> = [];

  activeGames: Array<Game>;
  nameOfCreatedGame = '';
  private ifWaitingRoomEnable = false;

  constructor(private websocketService: WebsocketService, private httpService: HttpService, private oauthService: OAuthService,
              private router: Router) {
    super({key: 'menu'});
    console.log('hhhhhhhhhhhhhhhhhhhhhhhh');
    if (!sessionStorage.getItem('access_token') || !sessionStorage.getItem('access_token')) {
      router.navigate(['home']);
    }
  }

  logout() {
    // this.oauthService.logoutUrl = "http://localhost:4200/home";
    this.websocketService.disconnect();
    if (!sessionStorage.getItem('access_token') || !sessionStorage.getItem('access_token')) {
      this.router.navigate(['home']);
    } else {
      this.oauthService.logOut();
      this.router.navigate(['home']);
    }
  }

  create() {
    console.log('hhhhhhhhhhhhhhhhhhhhhhhh');
    this.loadDataAboutGames();

    this.add.image(this.game.canvas.width / 2, this.game.canvas.height / 2, 'menu-background');

    this.showInformationAboutActiveGamesComponent();

    this.websocketService.ifChangeSceneOnWaitingRoom().subscribe((ifChange) => {
      this.ifWaitingRoomEnable = ifChange;
      this.scene.stop('menu');
      this.scene.start('main');
      this.router.navigate(['game'])
    });

    this.startButton.setInteractive();

    this.startButton.on('pointerover', () => {
      console.log('hovahh');
    });
    this.startButton.on('pointerout', () => {
      console.log('OUTAA HERE');
    });
    this.startButton.on('pointerup', () => {
      this.websocketService.getGames();
    });
  }

  preload() {
    this.load.image('menu-background', 'assets/menu/images/pacman-menu.jpg');

    this.load.image('start-button', 'assets/menu/images/start-button.jpg');
    this.load.image('join-button', 'assets/menu/images/join-button.jpg');
  }

  update() {
    console.log('SCENA MENU');
    if (this.ifWaitingRoomEnable) {

    }
  }

  loadDataAboutGames() {
    this.websocketService.initializeWebSocketConnection();

    setTimeout(() => {
      this.websocketService.getGames();
    }, 3000);
  }

  showInformationAboutActiveGamesComponent() {
    this.websocketService.getActiveGames().subscribe((games: Array<Game>) => {
      this.activeGames = games;

      this.joinButtons = [];
      for (let i = 0; i < this.activeGames.length; i++) {
        this.add.text(60, 100 + i * 50, '- ' + this.activeGames[i].name, {
          font: "40px Arial",
          fill: "#ff0044"
        });
        this.joinButtons.push(this.add.image(300, 125 + i * 50, 'join-button'));
      }
    });

    this.add.text(50, 50, 'Active games', {
      font: "40px Arial",
      fill: "#ff0044"
    });
    this.startButton = this.add.image(this.game.canvas.width / 2, this.game.canvas.height / 2 + 100, 'start-button');
  }

  createGame() {
    if (this.nameOfCreatedGame != '') {
      console.error(this.nameOfCreatedGame);
      this.websocketService.createGame(this.nameOfCreatedGame);
    }
  }

  onClick(event) {
    this.nameOfCreatedGame = event.target.value;
  }

}
