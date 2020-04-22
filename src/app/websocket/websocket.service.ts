import {Injectable} from '@angular/core';
import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import {Subject} from "rxjs";
import {Player} from "../model/Player";
import {Game} from "../model/Game";
import Sprite = Phaser.GameObjects.Sprite;

@Injectable()
export class WebsocketService {
  private serverUrl = 'https://localhost:8080/socket';
  private stompClient;

  private gameToAddPlayer = new Subject<Game>();
  private playerToRemove = new Subject<Player>();

  constructor() {}

  initializeWebSocketConnection() {
    const ws = new SockJS(this.serverUrl);
    this.stompClient = Stomp.over(ws);

    this.stompClient.connect({}, (frame) => {
      this.stompClient.subscribe('/pacman/add/players', (gameToAddPlayer) => {
          this.gameToAddPlayer.next(JSON.parse(gameToAddPlayer.body));
          console.error('Zaktualizowano gre, dodano gracza');
      });

      this.stompClient.subscribe('/pacman/remove/player', (playerToRemove) => {
        this.playerToRemove.next(JSON.parse(playerToRemove.body));
        console.error('Zaktualizowano gre, usunieto gracza');
      });

      this.stompClient.subscribe('/pacman/update/game', (message) => {
        if (message.body) {
          console.error('Update game');
        }
      });
    });
  }

  disconnect() {
    console.error('Disconnected');
    this.stompClient.disconnect();
  }

  sendPosition(player: Sprite) {
    this.stompClient.send('/app/send/position', {}, player.x, player.y);
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////

  getStompClient() {
    return this.stompClient;
  }

  getGameToAddPlayer() {
    return this.gameToAddPlayer.asObservable();
  }

  getPlayerToRemove() {
    return this.playerToRemove.asObservable();
  }
}
