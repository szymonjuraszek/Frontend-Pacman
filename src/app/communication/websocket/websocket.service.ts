import {Injectable} from '@angular/core';
import {BehaviorSubject} from "rxjs";
import {MeasurementService} from "../../cache/measurement.service";
import {Communicator} from "../Communicator";
import {SocketClientState} from "../SocketClientState";
import {RequestCacheService} from "../../cache/request-cache.service";
import {Client, IMessage} from '@stomp/stompjs';
import {JsonFormatter} from "../format/JsonFormatter";
import {ProtobufFormatter} from "../format/ProtobufFormatter";

@Injectable()
export class WebsocketService extends Communicator {
    // stomp websocket object
    private stompClient: Client;
    private playersOnTheSameSystemTime = 'local*'

    constructor(
        private measurementService: MeasurementService,
        private requestCache: RequestCacheService,
    ) {
        super();
    }

    initializeConnection() {
        this.state = new BehaviorSubject<SocketClientState>(SocketClientState.ATTEMPTING);

        this.stompClient = new Client({
            brokerURL: this.serverUrl,
            splitLargeFrames: true,
            reconnectDelay: 3000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000
        });

        this.stompClient.debug = () => {
        };

        this.stompClient.onConnect = (frame) => {

            this.stompClient.subscribe('/pacman/add/players', (gameToAddPlayer) => {
                this.playersToAdd.next(JSON.parse(gameToAddPlayer.body));
                console.error('Zaktualizowano gre, dodano gracza');
            });

            this.stompClient.subscribe('/pacman/remove/player', (playerToRemove) => {
                this.playerToRemove.next(this.formatter.decodePlayer(playerToRemove));
                console.error('Zaktualizowano gre, usunieto gracza');
            });

            this.stompClient.subscribe('/pacman/update/player', (playerToUpdate: IMessage) => {
                const parsedPlayer = this.formatter.decodePlayer(playerToUpdate);

                this.saveMeasurement(
                    parsedPlayer.nickname,
                    parsedPlayer.version,
                    playerToUpdate.headers.requestTimestamp,
                    playerToUpdate.headers['content-length']
                );

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
                const responseTimeInMillis = new Date().getTime() - Number(monster.headers.requestTimestamp);
                this.measurementService.addMonsterMeasurementWithTime(monsterParsed.id, Number(monster.headers.requestTimestamp), responseTimeInMillis);
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

            this.stompClient.subscribe('/user/queue/correct/player', (playerToUpdate: IMessage) => {
                const parsedPlayer = this.formatter.decodePlayer(playerToUpdate);
                console.error(parsedPlayer)

                this.saveMeasurement(
                    parsedPlayer.nickname,
                    parsedPlayer.version,
                    playerToUpdate.headers.requestTimestamp,
                    playerToUpdate.headers['content-length']
                );

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
            this.state.next(SocketClientState.ERROR);
        };

        this.stompClient.onWebSocketClose = (frame) => {
            console.error(frame);
        }

        this.stompClient.onWebSocketError = (frame) => {
            console.error(frame)
            this.state.next(SocketClientState.ERROR);
            this.stompClient.deactivate();
        }

        this.stompClient.activate();
    }

    //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    disconnect() {
        this.stompClient.deactivate();
    }

    saveMeasurement(
        nickname: string,
        version: number,
        requestTimestampHeader: string,
        contentLengthHeader: string
    ) {
        if (nickname.match(this.playersOnTheSameSystemTime) || nickname === this.myNickname) {
            const responseTimeInMillis = new Date().getTime() - Number(requestTimestampHeader);

            this.measurementService.addMeasurementResponse(
                nickname, responseTimeInMillis,
                Math.ceil((Number(requestTimestampHeader) - this.requestCache.timeForStartCommunication) / 1000),
                version, Number(contentLengthHeader), Number(requestTimestampHeader)
            );
        }
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
