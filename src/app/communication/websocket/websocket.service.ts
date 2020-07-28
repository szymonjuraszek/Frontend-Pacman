import {Injectable} from '@angular/core';
import * as Stomp from 'stompjs';
import * as SockJS from 'sockjs-client';
import {BehaviorSubject} from "rxjs";
import {MeasurementService} from "../../cache/measurement.service";
import {Communicator} from "../Communicator";
import {SocketClientState} from "../SocketClientState";
import {RequestCacheService} from "../../cache/request-cache.service";
import {WEBSOCKET_URL_MAIN} from "../../../../global-config";

@Injectable()
export class WebsocketService extends Communicator {
    private stompClient;

    // 'https://backend-pacman-app.herokuapp.com/socket'
    // 'http://localhost:8080/socket'

    constructor(private measurementService: MeasurementService, private requestCache: RequestCacheService) {
        super(WEBSOCKET_URL_MAIN);
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
                    this.measurementService.addMeasurementResponse(responseTimeInMillis, playerToUpdate.headers.timestamp, parsedPlayer.version);

                    if (parsedPlayer.nickname === this.myNickname) {
                        const request = this.requestCache.getRequest(parsedPlayer.version);
                        this.updateScore.next(parsedPlayer.score);

                        if (request !== null && (request.x !== parsedPlayer.positionX || request.y !== parsedPlayer.positionY)) {
                            this.playerToUpdate.next(parsedPlayer);
                        }
                    } else {
                        this.playerToUpdate.next(parsedPlayer);
                    }
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
                this.ifJoinGame.next(JSON.parse(currentCoinPosition.body));
            });

            this.stompClient.subscribe('/user/queue/player', (playerToUpdate) => {
                const responseTimeInMillis = new Date().getTime() - playerToUpdate.headers.timestamp;

                if (playerToUpdate.body) {
                    const parsedPlayer = JSON.parse(playerToUpdate.body);
                    this.measurementService.addMeasurementResponse(responseTimeInMillis, playerToUpdate.headers.timestamp, parsedPlayer.version);

                    const request = this.requestCache.getCorrectedPosition(parsedPlayer.version);

                    if (request !== null) {
                        parsedPlayer.positionX = request.x;
                        parsedPlayer.positionY = request.y;
                        this.playerToUpdate.next(parsedPlayer);
                    }
                }
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

    sendPosition(x, y, nickname, score, stepDirection, counterRequest) {
        this.stompClient.send('/app/send/position', {}, JSON.stringify({
                "nickname": nickname,
                "positionX": x,
                "positionY": y,
                "score": score,
                "stepDirection": stepDirection,
                "requestTimestamp": new Date().getTime(),
                "version": counterRequest,
                "data1": this.variable
            }
        ));
    }

    variable = this.makeid(50000);

    makeid(length) {
        var result           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
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
