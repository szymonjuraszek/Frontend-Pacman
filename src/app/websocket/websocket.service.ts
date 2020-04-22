import {Injectable} from '@angular/core';
import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import {Subject} from "rxjs";
import {Player} from "../model/Player";
import {Game} from "../model/Game";
import Sprite = Phaser.GameObjects.Sprite;
import List = Phaser.Structs.List;

@Injectable()
export class WebsocketService {
  private serverUrl = 'https://localhost:8080/socket';
  private stompClient;

  private playersToAdd = new Subject<Array<Player>>();
  private playerToRemove = new Subject<Player>();
  private playerToUpdate = new Subject<Player>();

  constructor() {}

  initializeWebSocketConnection() {
    const ws = new SockJS(this.serverUrl);
    this.stompClient = Stomp.over(ws);

    this.stompClient.connect({}, (frame) => {
      this.stompClient.subscribe('/pacman/add/players', (gameToAddPlayer) => {
          this.playersToAdd.next(JSON.parse(gameToAddPlayer.body));
          console.error('Zaktualizowano gre, dodano gracza');
      });

      this.stompClient.subscribe('/pacman/remove/player', (playerToRemove) => {
        this.playerToRemove.next(JSON.parse(playerToRemove.body));
        console.error('Zaktualizowano gre, usunieto gracza');
      });

      this.stompClient.subscribe('/pacman/update/player', (playerToUpdate) => {
        if (playerToUpdate.body) {
          // console.error(playerToUpdate.body);
          this.playerToUpdate.next(JSON.parse(playerToUpdate.body));
        }
      });
    });
  }

  disconnect() {
    console.error('Disconnected');
    this.stompClient.disconnect();
  }

  sendPosition(x: number, y: number, nickname: string) {
    this.stompClient.send('/app/send/position', {},JSON.stringify({
      "nickname": nickname,
      "positionX": x,
      "positionY": y
    }));
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////

  getStompClient() {
    return this.stompClient;
  }

  getPlayersToAdd() {
    return this.playersToAdd.asObservable();
  }

  getPlayerToRemove() {
    return this.playerToRemove.asObservable();
  }

  getPlayerToUpdate() {
    return this.playerToUpdate.asObservable();
  }
}
