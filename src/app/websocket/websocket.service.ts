import {Injectable} from '@angular/core';
import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';

@Injectable()
export class WebsocketService {
  private serverUrl = 'https://localhost:8080/socket';
  private stompClient;
  message = 'fd';
  private activeGame: Game;
  activeGames: Array<Game>;

  constructor() {
    console.log('Created service');
  }

  initializeWebSocketConnection() {
    const ws = new SockJS(this.serverUrl);
    this.stompClient = Stomp.over(ws);

    this.stompClient.connect({}, (frame) => {
      this.stompClient.subscribe('/activeGames', (games) => {
        console.log(games.body);
        this.activeGames = games.body;
        console.log(this.activeGames + ' aktywne gry')
      });

      this.stompClient.subscribe('/user', (message) => {
        if (message.body) {
          console.log(message.body);
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

  getStompClient() {
    return this.stompClient;
  }

  isGameCreated() {
    return this.stompClient.subscribe('/game', (message) => {
      if (message.body) {
        this.activeGame = message.body;

      }
    });
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

class Game {
  public id: number;
  public active: boolean;
}

