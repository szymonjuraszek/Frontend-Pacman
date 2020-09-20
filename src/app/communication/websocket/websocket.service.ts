import {Injectable} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {MeasurementService} from "../../cache/measurement.service";
import {Communicator} from "../Communicator";
import {SocketClientState} from "../SocketClientState";
import {RequestCacheService} from "../../cache/request-cache.service";
import {WEBSOCKET_URL_MAIN} from "../../../../global-config";
import {Client, Stomp} from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';

import {PlayerProto} from "../../../../proto/generated/proto/player_pb";
import {Player} from "../../model/Player";
import {IFormatter} from "../format/IFormatter";
import {JsonFormatter} from "../format/JsonFormatter";
import {ProtobufFormatter} from "../format/ProtobufFormatter";
import {CustomBinaryFormatter} from "../format/CustomBinaryFormatter";

@Injectable()
export class WebsocketService extends Communicator {
    // 'https://backend-pacman-app.herokuapp.com/socket'
    // 'http://localhost:8080/socket'
    private stompClient: Client;
    private formatter: IFormatter;

    constructor(
        private measurementService: MeasurementService,
        private requestCache: RequestCacheService,
    ) {
        super(WEBSOCKET_URL_MAIN);
        this.setFormatter(new ProtobufFormatter());
    }

    initializeConnection() {
        // const ws = new SockJS(this.serverUrl);
        // this.stompClient = Stomp.over(ws);
        this.state = new BehaviorSubject<SocketClientState>(SocketClientState.ATTEMPTING);

        this.stompClient = new Client({
            brokerURL: this.serverUrl,
            debug: function (str) {
                console.log(str);
            },
            // maxWebSocketChunkSize: 5000,
            splitLargeFrames: true,
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000
        });

        this.stompClient.debug = () => {};

        this.stompClient.onConnect = (frame) => {

            console.error(frame)
            this.stompClient.subscribe('/pacman/add/players', (gameToAddPlayer) => {
                this.playersToAdd.next(JSON.parse(gameToAddPlayer.body));
                console.error('Zaktualizowano gre, dodano gracza');
            });

            this.stompClient.subscribe('/pacman/remove/player', (playerToRemove) => {
                this.playerToRemove.next(this.formatter.decodePlayer(playerToRemove));
                console.error('Zaktualizowano gre, usunieto gracza');
            });

            this.stompClient.subscribe('/pacman/update/player', (playerToUpdate) => {
                const parsedPlayer = this.formatter.decodePlayer(playerToUpdate);

                const responseTimeInMillis = new Date().getTime() - Number(playerToUpdate.headers.timestamp);
                // console.error("Odpowiedz serwera " + responseTimeInMillis + " milliseconds")

                this.measurementService.addMeasurementResponse(parsedPlayer.nickname, responseTimeInMillis, playerToUpdate.headers.timestamp, parsedPlayer.version);

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
                const monsterParsed = this.formatter.decodeMonster(monster);
                this.measurementService.addMeasurementResponse(monsterParsed.id, new Date().getTime() - Number(monster.headers.timestamp), monster.headers.timestamp,0);
                this.monsterToUpdate.next(monsterParsed);
            });

            this.stompClient.subscribe('/pacman/refresh/coins', () => {
                this.refreshCoin.next();
            });

            this.stompClient.subscribe('/pacman/get/coin', (coinPosition) => {
                this.coinToGet.next(this.formatter.decodeCoin(coinPosition));
            });

            this.stompClient.subscribe('/user/queue/reply', (currentCoinPosition) => {
                this.ifJoinGame.next(JSON.parse(currentCoinPosition.body));
            });

            this.stompClient.subscribe('/user/queue/player', (playerToUpdate) => {
                const parsedPlayer = this.formatter.decodePlayer(playerToUpdate);

                const responseTimeInMillis = new Date().getTime() - Number(playerToUpdate.headers.timestamp);

                this.measurementService.addMeasurementResponse(parsedPlayer.nickname, responseTimeInMillis, playerToUpdate.headers.timestamp, parsedPlayer.version);

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

    sendPosition(dataToSend) {
        const dataWithSpecificFormat = this.formatter.encode(dataToSend);
        if (this.formatter instanceof JsonFormatter) {
            this.stompClient.publish({
                destination: '/app/send/position',
                body: JSON.stringify(
                    dataWithSpecificFormat
                ),
                headers: {
                    requestTimestamp: new Date().getTime().toString()
                }
            });
        } else if (this.formatter instanceof ProtobufFormatter) {
            this.stompClient.publish({
                destination: '/app/send/position/protobuf',
                binaryBody: dataWithSpecificFormat.serializeBinary(),
                headers: {
                    /*'content-type': 'application/octet-stream',*/
                    requestTimestamp: new Date().getTime().toString()
                }
            });
        } else {
            this.stompClient.publish({
                destination: '/app/send/position/custom/binary',
                binaryBody: dataWithSpecificFormat,
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

    setFormatter(formatter) {
        this.formatter = formatter;
    }
}
