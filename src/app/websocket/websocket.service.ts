import {Injectable} from '@angular/core';
import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import {Observable, Subject} from "rxjs";

@Injectable()
export class WebsocketService {
  private serverUrl = 'https://localhost:8080/socket';
  private stompClient;

  message = 'fd';

  private activeGames = new Subject<Array<Game>>();
  private ifWaitingRoomEnable = new Subject<boolean>();
  private nameOfCreatedGame: string;
  myGame: Game;

  constructor() {}

  getActiveGames() {
    return this.activeGames.asObservable();
  }

  getNameOfCreatedGame() {
    return this.nameOfCreatedGame;
  }

  setNameOfCreatedGame(name: string) {
    this.nameOfCreatedGame = name;
  }

  ifChangeSceneOnWaitingRoom() {
    return this.ifWaitingRoomEnable.asObservable();
  }

  initializeWebSocketConnection() {
    const ws = new SockJS(this.serverUrl);
    this.stompClient = Stomp.over(ws);

    this.stompClient.connect({}, (frame) => {
      this.stompClient.subscribe('/pacman/game', (createdGame) => {
        let game: Game;
        game = JSON.parse(createdGame.body);
        if(game.name === this.nameOfCreatedGame) {
          this.myGame = game;
          console.error('nazwa: ' + this.myGame.name);
          console.error('id: ' + this.myGame.id);
          console.error('active: ' + this.myGame.active);
          this.ifWaitingRoomEnable.next(true);
        } else {
          console.error('Nie dla ciebie wiadomosc');
        }
      });

      this.stompClient.subscribe('/pacman/activeGames', (message) => {
        console.error('active games');
        if (message.body) {
          this.activeGames.next(JSON.parse(message.body));
        }
      });

      this.stompClient.subscribe('/chat', (message) => {
        if (message.body) {
          this.message = message.body;
          console.log(message.body);
        }
      });
    });
  }

  disconnect() {
    console.error('Disconnected');
    this.stompClient.disconnect();
  }

  sendMessage(x, y) {
    // const jsonMessage = {
    //   x: x,
    //   y: y
    // };
    // console.log(jsonMessage);

    this.stompClient.send('/app/send/message', {}, JSON.stringify(new Message(x, y)));
  }

  sendMessageSth(message) {
    this.stompClient.send('/app/send/sth', {}, message);
  }

  getGames() {
    console.log('wysylam wiadomsoc do app/games')
    this.stompClient.send('/app/games', {}, 'fdsfffff');
  }

  createGame(name: string) {
    this.nameOfCreatedGame = name;
    console.log('Tworze gre o nazwie: ' + name)
    this.stompClient.send('/app/game', {}, name);
  }

  getStompClient() {
    return this.stompClient;
  }
}

class Message {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }
}

export class Game {
  id: number;
  name: string;
  active: boolean;
}

