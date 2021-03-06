import {Injectable} from '@angular/core';
import {Communicator} from "../Communicator";
import {MeasurementService} from "../../cache/measurement.service";
import {RSocketClient} from 'rsocket-core';
import {BehaviorSubject} from "rxjs";
import {SocketClientState} from "../SocketClientState";
import {RequestCacheService} from "../../cache/request-cache.service";
import {Player} from "../../model/Player";
import {DATA_MIME_TYPE, SERIALIZER_DATA, SERIALIZER_METADATA} from "../../../../global-config";
import {JsonFormatter} from "../format/JsonFormatter";
import RSocketWebSocketClient from "rsocket-websocket-client";

@Injectable({
    providedIn: 'root'
})
export class RsocketService extends Communicator {
    // rsocket object connection
    private client: RSocketClient<any, string | Buffer | Uint8Array>;
    private rsocketObject: any;

    // subscriptions
    private coinRefreshSub: any;
    private coinGetSub: any;
    private monstersUpdateSub: any;
    private playersAddedSub: any;
    private playerRemoveSub: any;
    private playerUpdateSub: any;
    private playerUpdateUserSub: any;

    constructor(
        private measurementService: MeasurementService,
        private requestCache: RequestCacheService
    ) {
        super();
        this.setFormatter(new JsonFormatter());
    }

    initializeConnection() {
        this.client = new RSocketClient({
            serializers: {
                data: SERIALIZER_DATA,
                metadata: SERIALIZER_METADATA
            },
            setup: {
                // ms btw sending keepalive to server
                keepAlive: 60000,
                // ms timeout if no keepalive response
                lifetime: 180000,
                // format of `data`
                dataMimeType: DATA_MIME_TYPE,
                // format of `metadata`
                metadataMimeType: 'message/x.rsocket.routing.v0',
                payload: {
                    data: this.formatter.prepareNicknamePayload(this.myNickname)
                }
            },
            transport: new RSocketWebSocketClient({
                url: this.serverUrl,
                debug: true
            })
        });

        this.state = new BehaviorSubject<SocketClientState>(SocketClientState.ATTEMPTING);

        this.client.connect().subscribe({
            onComplete: (socket) => {
                this.rsocketObject = socket;

                socket.requestStream({
                    metadata: String.fromCharCode('monstersUpdate'.length) + 'monstersUpdate',
                }).subscribe({
                    onComplete: () => console.log('complete'),
                    onError: error => {
                        console.log(error);
                        this.state.next(SocketClientState.ERROR);
                    },
                    onNext: (payload) => {
                        const responseTimeInMillis = new Date().getTime() - payload.data.requestTimestamp;
                        this.measurementService.addMonsterMeasurementWithTime(payload.data.id, payload.data.requestTimestamp, responseTimeInMillis);
                        this.monsterToUpdate.next(payload.data);
                    },
                    onSubscribe: (subscription) => {
                        console.error('========= Subskrybuje monsterUpdate ============')
                        subscription.request(2147483640);
                        this.monstersUpdateSub = subscription;
                    }
                });

                socket.requestStream({
                    metadata: String.fromCharCode('playersAdded'.length) + 'playersAdded',
                }).subscribe({
                    onComplete: () => console.log('complete'),
                    onError: error => {
                        console.log(error);
                        this.state.next(SocketClientState.ERROR);
                    },
                    onNext: payload => {
                        console.error('Dodaje gracza')
                        this.playersToAdd.next(payload.data);
                    },
                    onSubscribe: subscription => {
                        console.error('======== Subskrybuje playersAdded ===========')
                        subscription.request(2147483641);
                        this.playersAddedSub = subscription;
                    },
                });

                socket.requestStream({
                    metadata: String.fromCharCode('playerRemove'.length) + 'playerRemove',
                }).subscribe({
                    onComplete: () => console.log('complete'),
                    onError: error => {
                        console.log(error);
                        this.state.next(SocketClientState.ERROR);
                    },
                    onNext: payload => {
                        this.playerToRemove.next(payload.data);
                    },
                    onSubscribe: subscription => {
                        console.error('========= Subskrybuje playerRemove ============')
                        subscription.request(2147483642);
                        this.playerRemoveSub = subscription;
                    },
                });

                socket.requestStream({
                    metadata: String.fromCharCode('playerUpdate'.length) + 'playerUpdate',
                }).subscribe({
                    onComplete: () => console.log('complete'),
                    onError: error => {
                        console.log(error);
                        this.state.next(SocketClientState.ERROR);
                    },
                    onNext: playerToUpdate => {
                        const parsedPlayer: Player = playerToUpdate.data;

                        if (this.ifSave(parsedPlayer.nickname)) {
                            this.measurementService.addMeasurementResponse(parsedPlayer.nickname,
                                new Date().getTime() - playerToUpdate.data.requestTimestamp,
                                Math.ceil((playerToUpdate.data.requestTimestamp - this.requestCache.timeForStartCommunication) / 1000),
                                parsedPlayer.version, playerToUpdate.data.contentLength, playerToUpdate.data.requestTimestamp);
                        }

                        if (parsedPlayer.nickname === this.myNickname) {
                            const request = this.requestCache.getRequest(parsedPlayer.version);
                            this.updateScore.next(parsedPlayer.score);
                            if (request !== null && (request.x !== parsedPlayer.positionX || request.y !== parsedPlayer.positionY)) {
                                this.playerToUpdate.next(parsedPlayer);
                            }
                        } else {
                            this.playerToUpdate.next(parsedPlayer);
                        }
                    },
                    onSubscribe: subscription => {
                        console.error('========= Subskrybuje playerUpdate ============')
                        subscription.request(2147483643);
                        this.playerUpdateSub = subscription;
                    },
                });

                socket.requestStream({
                    data: this.formatter.prepareNicknamePayload(this.myNickname),
                    metadata: String.fromCharCode('playerUpdateUser'.length) + 'playerUpdateUser',
                }).subscribe({
                    onComplete: () => console.log('complete'),
                    onError: error => {
                        console.log(error);
                        this.state.next(SocketClientState.ERROR);
                    },
                    onNext: playerToUpdate => {
                        const parsedPlayer: Player = playerToUpdate.data;

                        if (this.ifSave(parsedPlayer.nickname)) {
                            this.measurementService.addMeasurementResponse(parsedPlayer.nickname,
                                new Date().getTime() - playerToUpdate.data.requestTimestamp,
                                Math.ceil((playerToUpdate.data.requestTimestamp - this.requestCache.timeForStartCommunication) / 1000),
                                parsedPlayer.version, playerToUpdate.data.contentLength, playerToUpdate.data.requestTimestamp);
                        }

                        const request = this.requestCache.getCorrectedPosition(parsedPlayer.version);

                        if (request !== null) {
                            parsedPlayer.positionX = request.x;
                            parsedPlayer.positionY = request.y;
                            this.playerToUpdate.next(parsedPlayer);
                        }
                    },
                    onSubscribe: subscription => {
                        console.error('========= Subskrybuje specificPlayerUpdate ============')
                        subscription.request(2147483644);
                        this.playerUpdateUserSub = subscription;
                    },
                });

                socket.requestStream({
                    metadata: String.fromCharCode('coinGet'.length) + 'coinGet',
                }).subscribe({
                    onComplete: () => console.log('complete'),
                    onError: error => {
                        console.log(error);
                        this.state.next(SocketClientState.ERROR);
                    },
                    onNext: payload => {
                        this.coinToGet.next(payload.data);
                    },
                    onSubscribe: subscription => {
                        console.error('========= Subskrybuje coinGet ============')
                        subscription.request(2147483645);
                        this.coinGetSub = subscription;
                    },
                });

                socket.requestStream({
                    metadata: String.fromCharCode('coinRefresh'.length) + 'coinRefresh',
                }).subscribe({
                    onComplete: () => console.log('complete'),
                    onError: error => {
                        console.log(error);
                        this.state.next(SocketClientState.ERROR);
                    },
                    onNext: () => {
                        this.refreshCoin.next();
                    },
                    onSubscribe: subscription => {
                        console.error('========= Subskrybuje refershCoin ============')
                        subscription.request(2147483646);
                        this.coinRefreshSub = subscription;
                    },
                });

                this.state.next(SocketClientState.CONNECTED);
            },
            onError: error => {
                console.log(error);
                this.state.next(SocketClientState.ERROR);
            },
            onSubscribe: () => {
            }
        });
    }

    joinToGame(nickname: string) {
        this.rsocketObject
            .requestResponse({
                metadata: String.fromCharCode('joinToGame'.length) + 'joinToGame',
            }).subscribe({
            onComplete: (currentCoinPosition) => {
                this.ifJoinGame.next(currentCoinPosition.data);
            },
            onError: error => {
                console.log('got error with requestResponse');
                console.error(error);
                this.state.next(SocketClientState.ERROR);
            }
        });
    }

    sendPosition(dataToSend) {
        const encodedData = this.formatter.encode(dataToSend);
        encodedData["contentLength"] = JSON.stringify(encodedData).length;
        encodedData["requestTimestamp"] = new Date().getTime();

        this.rsocketObject.fireAndForget({
            data: encodedData,
            metadata: String.fromCharCode('sendPosition'.length) + 'sendPosition'
        });
    }

    addPlayer(nickname: string) {
        this.rsocketObject.fireAndForget({
            data: this.formatter.prepareNicknamePayload(this.myNickname),
            metadata: String.fromCharCode('addNewPlayers'.length) + 'addNewPlayers',
        });
    }

    disconnect() {
        this.coinRefreshSub.cancel();
        this.coinGetSub.cancel();
        this.monstersUpdateSub.cancel();
        this.playersAddedSub.cancel();
        this.playerRemoveSub.cancel();
        this.playerUpdateSub.cancel();
        this.playerUpdateUserSub.cancel();

        this.rsocketObject.fireAndForget({
            data: this.formatter.prepareNicknamePayload(this.myNickname),
            metadata: String.fromCharCode('disconnect'.length) + 'disconnect',
        });
        this.client.close();
    }

    setFormatter(formatter) {
        this.formatter = formatter;
    }

    ifSave(nickname): boolean {
        return (nickname.match('local*') || nickname === this.myNickname)
    }
}
