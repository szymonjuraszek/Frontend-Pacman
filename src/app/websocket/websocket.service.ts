import {Injectable} from '@angular/core';
import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import {BehaviorSubject, Subject} from "rxjs";
import {Player} from "../model/Player";
import {Monster} from "../model/Monster";
import {MeasurementService} from "../cache/measurement.service";

@Injectable()
export class WebsocketService {
  private serverUrl = 'https://pacman-application.herokuapp.com/socket';
  private state: BehaviorSubject<SocketClientState>;
  private stompClient;

  // 'https://backend-pacman-app.herokuapp.com/socket'
  // 'https://localhost:8080/socket'

  private playersToAdd = new Subject<Array<Player>>();
  private playerToRemove = new Subject<Player>();
  private playerToUpdate = new Subject<Player>();
  private monsterToUpdate = new Subject<Monster>();
  private ifJoinGame = new Subject<any>();
  private updateMap = new Subject<string>();
  private counter =0;
  private sth= "";

  constructor(private measurementService: MeasurementService) {}

  initializeWebSocketConnection() {
    const ws = new SockJS(this.serverUrl);
    this.stompClient = Stomp.over(ws);
    this.state = new BehaviorSubject<SocketClientState>(SocketClientState.ATTEMPTING);

    this.stompClient.connect({}, (frame) => {

      // console.error(frame);
      this.stompClient.subscribe('/pacman/add/players', (gameToAddPlayer) => {
          this.playersToAdd.next(JSON.parse(gameToAddPlayer.body));
          console.error('Zaktualizowano gre, dodano gracza');
      });

      this.stompClient.subscribe('/pacman/remove/player', (playerToRemove) => {
        this.playerToRemove.next(JSON.parse(playerToRemove.body));
        console.error('Zaktualizowano gre, usunieto gracza');
      });

      this.stompClient.subscribe('/pacman/update/player', (playerToUpdate) => {
        const responseTimeInMillis = new Date().getTime() - playerToUpdate.headers.timestamp;
        console.error("Odpowiedz serwera " + responseTimeInMillis + " milliseconds")

        if (playerToUpdate.body) {
          const parsedPlayer = JSON.parse(playerToUpdate.body);
          this.measurementService.addMeasurementResponse(
              parsedPlayer.nickname, responseTimeInMillis, playerToUpdate.headers.timestamp);
          this.playerToUpdate.next(parsedPlayer);
        }
      });

      this.stompClient.subscribe('/pacman/update/monster', (monster) => {
        if (monster.body) {
          this.monsterToUpdate.next(JSON.parse(monster.body));
        }
      });

      this.stompClient.subscribe('/pacman/update/map', (updateCommand) => {
        if(updateCommand.body == 'UPDATE') {
          this.updateMap.next(updateCommand);
        } else {
          console.error('Error nie mozna updatowac monet')
        }
      });

      this.stompClient.subscribe('/user/queue/reply', (currentCoinPosition) => {
        // console.error('wyswietlam obecne pozycje monet ' + currentCoinPosition);
        this.ifJoinGame.next(JSON.parse(currentCoinPosition.body));
      });

      this.stompClient.subscribe('/pacman/collision/update', (allCoinPosition: string) => {
      });

      this.state.next(SocketClientState.CONNECTED);
    }, (error) => {
      this.state.next(SocketClientState.ERROR);
    });
  }

  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

  disconnect() {
    console.error('Disconnected');
    this.stompClient.disconnect();
  }

  sendPosition(x: number, y: number, nickname: string, score: number) {
    // this.counter = this.counter+ 1
    // this.sth = this.sth + 'aaaaaaa'
    this.stompClient.send('/app/send/position', {},JSON.stringify({
      "nickname": nickname,
      "positionX": x,
      "positionY": y,
      "score": score,
      "requestTimestamp": new Date().getTime()
    }));
  }

  joinToGame(nickname: string) {
    this.stompClient.send('/app/join/game', {}, JSON.stringify({
      "nickname": nickname
    }));
  }

  addPlayer(nickname: string) {
    this.stompClient.send('/app/add/player', {}, JSON.stringify({
      "nickname": nickname
    }));
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

  getIfJoinGame() {
    return this.ifJoinGame.asObservable();
  }

  getUpdateMap() {
    return this.updateMap.asObservable();
  }
}

export enum SocketClientState {
  CONNECTED,
  ATTEMPTING,
  ERROR
}
