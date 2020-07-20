import {Injectable} from '@angular/core';
import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import {BehaviorSubject} from "rxjs";
import {MeasurementService} from "../../cache/measurement.service";
import {Communicator} from "../Communicator";
import {Direction} from "../Direction";
import {SocketClientState} from "../SocketClientState";

@Injectable()
export class WebsocketService extends Communicator {
    private stompClient;

    // 'https://backend-pacman-app.herokuapp.com/socket'
    // 'http://localhost:8080/socket'

    constructor(private measurementService: MeasurementService) {
        super('http://192.168.0.101:8080/socket');
    }

    initializeConnection() {
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
                // console.error("Odpowiedz serwera " + responseTimeInMillis + " milliseconds")

                if (playerToUpdate.body) {
                    const parsedPlayer = JSON.parse(playerToUpdate.body);
                    this.measurementService.addMeasurementResponse(responseTimeInMillis, playerToUpdate.headers.timestamp, playerToUpdate.headers.version);
                    this.playerToUpdate.next(parsedPlayer);
                }
            });

            this.stompClient.subscribe('/pacman/update/monster', (monster) => {
                if (monster.body) {
                    this.monsterToUpdate.next(JSON.parse(monster.body));
                }
            });

            this.stompClient.subscribe('/pacman/refresh/coins', (refreshCoinsCommand: string) => {
                this.refreshCoin.next(refreshCoinsCommand);
            });

            this.stompClient.subscribe('/pacman/get/coin', (coinPosition) => {
                console.error(coinPosition.body)
                this.coinToGet.next(JSON.parse(coinPosition.body));
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

    sendPosition(x: number, y: number, nickname: string, score: number, stepDirection: Direction) {
        this.stompClient.send('/app/send/position', {}, JSON.stringify({
                "nickname": nickname,
                "positionX": x,
                "positionY": y,
                "score": score,
                "stepDirection": stepDirection,
                "requestTimestamp": new Date().getTime()
            }
        ));
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
}
