import {Component, Injectable} from '@angular/core';
import {WebsocketService} from '../../websocket/websocket.service';
import Phaser from 'phaser';
import * as SockJS from 'sockjs-client';
import {HttpService} from '../../http/http.service';
import {Game} from '../../model/game';
import {JwksValidationHandler, OAuthService} from "angular-oauth2-oidc";
import {authCodeFlowConfig} from "../../sso.config";

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
  private a = false;
  games: Array<Game>;

  constructor(private websocketService: WebsocketService, private httpService: HttpService, private oauthService: OAuthService) {
    super({key: 'menu'});
  }

  create() {
    // this.httpService.getAllGames().subscribe((games) => {
    //   this.games = games;
    // });

    this.websocketService.initializeWebSocketConnection();
    // this.oauthService.configure(authCodeFlowConfig);
    // this.oauthService.tokenValidationHandler = new JwksValidationHandler();
    // this.oauthService.loadDiscoveryDocument();
    // this.oauthService.tokenEndpoint = 'http://localhost:8080/api/token';
    // this.oauthService.tryLoginCodeFlow();

    console.log('MENU CREATE !!!');

    this.add.image(this.game.canvas.width / 2, this.game.canvas.height / 2, 'menu-background');
    this.add.text(50, 50, 'Active games', {
      font: "40px Arial",
      fill: "#ff0044"
    });
    this.startButton = this.add.image(this.game.canvas.width / 2, this.game.canvas.height / 2 + 100, 'start-button');

    this.startButton.setInteractive();

    this.startButton.on('pointerover', () => {
      console.log('hovahh');
    });
    this.startButton.on('pointerout', () => {
      console.log('OUTAA HERE');
    });
    this.startButton.on('pointerup', () => {
      // this.websocketService.
      // this.oauthService.initCodeFlow();
    });

  }

  preload() {
    console.log('preload for menu component!');

    this.load.image('menu-background', 'assets/menu/images/pacman-menu.jpg');
    this.load.image('start-button', 'assets/menu/images/start-button.jpg');
  }

  update() {
    console.log('SCENA MENU');
  }

}
