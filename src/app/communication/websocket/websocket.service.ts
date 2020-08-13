import {Injectable} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {MeasurementService} from "../../cache/measurement.service";
import {Communicator} from "../Communicator";
import {SocketClientState} from "../SocketClientState";
import {RequestCacheService} from "../../cache/request-cache.service";
import {BINARY_FORMAT, WEBSOCKET_URL_MAIN} from "../../../../global-config";
import {Client} from '@stomp/stompjs';
import {DecoderService} from "../decoder/decoder.service";


@Injectable()
export class WebsocketService extends Communicator {
    // 'https://backend-pacman-app.herokuapp.com/socket'
    // 'http://localhost:8080/socket'
    private stompClient: Client;

    constructor(
        private measurementService: MeasurementService,
        private requestCache: RequestCacheService,
        private decoder: DecoderService
    ) {
        super(WEBSOCKET_URL_MAIN);
    }

    initializeConnection() {
        this.state = new BehaviorSubject<SocketClientState>(SocketClientState.ATTEMPTING);

        this.stompClient = new Client({
            brokerURL: this.serverUrl,
            debug: function (str) {
                console.log(str);
            },
            splitLargeFrames: true,
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000
        });

        this.stompClient.onConnect = () => {
            this.stompClient.subscribe('/pacman/add/players', (gameToAddPlayer) => {
                this.playersToAdd.next(JSON.parse(gameToAddPlayer.body));
                console.error('Zaktualizowano gre, dodano gracza');
            });

            this.stompClient.subscribe('/pacman/remove/player', (playerToRemove) => {
                this.playerToRemove.next(this.decoder.decodePlayer(playerToRemove));
                console.error('Zaktualizowano gre, usunieto gracza');
            });

            this.stompClient.subscribe('/pacman/update/player', (playerToUpdate) => {
                const parsedPlayer = this.decoder.decodePlayer(playerToUpdate);

                const responseTimeInMillis = new Date().getTime() - Number(playerToUpdate.headers.timestamp);
                // console.error("Odpowiedz serwera " + responseTimeInMillis + " milliseconds")

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
            });

            this.stompClient.subscribe('/pacman/update/monster', (monster) => {
                this.monsterToUpdate.next(this.decoder.decodeMonster(monster));
            });

            this.stompClient.subscribe('/pacman/refresh/coins', () => {
                this.refreshCoin.next();
            });

            this.stompClient.subscribe('/pacman/get/coin', (coinPosition) => {
                this.coinToGet.next(this.decoder.decodeCoin(coinPosition));
            });

            this.stompClient.subscribe('/user/queue/reply', (currentCoinPosition) => {
                this.ifJoinGame.next(JSON.parse(currentCoinPosition.body));
            });

            this.stompClient.subscribe('/user/queue/player', (playerToUpdate) => {
                const parsedPlayer = this.decoder.decodePlayer(playerToUpdate);
                const responseTimeInMillis = new Date().getTime() - Number(playerToUpdate.headers.timestamp);

                this.measurementService.addMeasurementResponse(responseTimeInMillis, playerToUpdate.headers.timestamp, parsedPlayer.version);

                const request = this.requestCache.getCorrectedPosition(parsedPlayer.version);

                if (request !== null) {
                    parsedPlayer.positionX = request.x;
                    parsedPlayer.positionY = request.y;
                    this.playerToUpdate.next(parsedPlayer);
                }

            });

            this.stompClient.subscribe('/pacman/collision/update', (allCoinPosition) => {
            });

            this.state.next(SocketClientState.CONNECTED);
        };

        this.stompClient.onStompError = (frame) => {
            console.log('Broker reported error: ' + frame.headers['message']);
            console.log('Additional details: ' + frame.body);
        };

        this.stompClient.activate();
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    disconnect() {
        console.error('Disconnected');
        this.stompClient.deactivate();
    }

    sendPosition(x, y, nickname, score, stepDirection, counterRequest) {
        if (!BINARY_FORMAT) {
            this.stompClient.publish({
                destination: '/app/send/position',
                body: JSON.stringify({
                    "nickname": nickname,
                    "positionX": x,
                    "positionY": y,
                    "score": score,
                    "stepDirection": stepDirection,
                    "version": counterRequest
                    // "data1": this.variable
                }),
                headers: {
                    requestTimestamp: new Date().getTime().toString()
                }
            });
        } else {
            const numbersToSend = new Int16Array(4);
            numbersToSend[0] = x;
            numbersToSend[1] = y;
            numbersToSend[2] = score;
            numbersToSend[3] = counterRequest;
            const b = new Uint8Array(numbersToSend.buffer);

            const textToSend = nickname + '|' + stepDirection.toString();
            const a = new Uint8Array(19);
            for (let i = 0, strLen = textToSend.length; i < strLen; i++) {
                a[i] = textToSend.charCodeAt(i);
            }

            //join two Uint8array
            const dataToSend = new Uint8Array(a.length + b.length);
            dataToSend.set(a);
            dataToSend.set(new Uint8Array(numbersToSend.buffer), a.length);

            this.stompClient.publish({
                destination: '/app/send/position/binary',
                binaryBody: dataToSend,
                headers: {
                    /*'content-type': 'application/octet-stream',*/
                    requestTimestamp: new Date().getTime().toString()
                }
            });
        }
    }

    joinToGame(nickname: string) {
        this.stompClient.publish({
            destination: '/app/join/game',
            body: JSON.stringify({
                "nickname": nickname
            })
        });
    }

    addPlayer(nickname: string) {
        this.stompClient.publish({
            destination: '/app/add/player',
            body: JSON.stringify({
                "nickname": nickname
            })
        });
    }

    variable = this.makeid(30000);

    makeid(length) {
        var result = '';
        var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for (var i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return result;
    }
}
