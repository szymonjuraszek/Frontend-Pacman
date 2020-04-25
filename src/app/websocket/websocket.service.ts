import {Injectable} from '@angular/core';
import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import {BehaviorSubject, Subject} from "rxjs";
import {Player} from "../model/Player";
import {Game} from "../model/Game";
import Sprite = Phaser.GameObjects.Sprite;
import List = Phaser.Structs.List;
import {Monster} from "../model/Monster";

@Injectable()
export class WebsocketService {
  private serverUrl = 'https://localhost:8080/socket';
  private state: BehaviorSubject<SocketClientState>;
  private stompClient;

  private playersToAdd = new Subject<Array<Player>>();
  private playerToRemove = new Subject<Player>();
  private playerToUpdate = new Subject<Player>();
  private monsterToUpdate = new Subject<Monster>();
  private exitGame = new Subject<Boolean>();
  private ifJoinGame = new Subject<string>();

  constructor() {}

  initializeWebSocketConnection() {
    const ws = new SockJS(this.serverUrl);
    this.stompClient = Stomp.over(ws);
    this.state = new BehaviorSubject<SocketClientState>(SocketClientState.ATTEMPTING);

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

      this.stompClient.subscribe('/pacman/update/monster', (monster) => {
        if (monster.body) {
          this.monsterToUpdate.next(JSON.parse(monster.body));
        }
      });

      this.stompClient.subscribe('/pacman/exit/game', (ifRemove) => {
        this.exitGame.next(JSON.parse(ifRemove.body));
        console.error('Wychodze z gry!');
      });

      this.stompClient.subscribe('/pacman/join/game', (playerNickname) => {
        this.ifJoinGame.next(playerNickname.body);
      });

      this.state.next(SocketClientState.CONNECTED);
    }, (error) => {
      this.state.next(SocketClientState.ERROR);
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

  quitGame(nickname: string) {
    this.stompClient.send('/app/exit/game', {},nickname);
  }

  joinGame(nickname: string) {
    this.stompClient.send('/app/join/game', {},nickname);
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  getState() {
    return this.state.asObservable();
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

  getMonsterToUpdate() {
    return this.monsterToUpdate.asObservable();
  }

  getExitGame() {
    return this.exitGame.asObservable();
  }

  getIfJoinGame() {
    return this.ifJoinGame.asObservable();
  }
}

export enum SocketClientState {
  CONNECTED,
  ATTEMPTING,
  ERROR
}
