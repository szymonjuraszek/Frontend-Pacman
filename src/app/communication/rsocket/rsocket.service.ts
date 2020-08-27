import {Injectable} from '@angular/core';
import {Communicator} from "../Communicator";
import {MeasurementService} from "../../cache/measurement.service";
import RSocketWebSocketClient from 'rsocket-websocket-client';
import {IdentitySerializer, JsonSerializer, RSocketClient} from 'rsocket-core';
import {BehaviorSubject} from "rxjs";
import {SocketClientState} from "../SocketClientState";
import {RequestCacheService} from "../../cache/request-cache.service";
import {Player} from "../../model/Player";
import {RSOCKET_URL_MAIN} from "../../../../global-config";
import {DownloadService} from "../../downloader/download.service";

@Injectable({
    providedIn: 'root'
})
export class RsocketService extends Communicator {
    private client: RSocketClient;
    private rsocketObject: RSocketWebSocketClient;

    private coinRefreshSub: any;
    private coinGetSub: any;
    private monstersUpdateSub: any;
    private playersAddedSub: any;
    private playerRemoveSub: any;
    private playerUpdateSub: any;
    private playerUpdateUserSub: any;

    constructor(private measurementService: MeasurementService,private requestCache: RequestCacheService,
    private downloaderService: DownloadService) {
        super(RSOCKET_URL_MAIN);
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
            data: {
                'nickname': this.myNickname
            },
            metadata: String.fromCharCode('disconnect'.length) + 'disconnect',
        });
        this.client.close();
    }

    initializeConnection() {
        this.client = new RSocketClient({
            serializers: {
                data: JsonSerializer,
                metadata: IdentitySerializer
            },
            setup: {
                // ms btw sending keepalive to server
                keepAlive: 60000,
                // ms timeout if no keepalive response
                lifetime: 180000,
                // format of `data`
                dataMimeType: 'application/json',
                // format of `metadata`
                metadataMimeType: 'message/x.rsocket.routing.v0',
                payload: {
                    data: {
                        nickname: this.myNickname
                    }
                },
            },
            transport: new RSocketWebSocketClient({
                url: this.serverUrl
            }),
        });

        this.state = new BehaviorSubject<SocketClientState>(SocketClientState.ATTEMPTING);

        this.client.connect().subscribe({
            onComplete: socket => {
                console.error(socket)

                this.rsocketObject = socket;
                this.downloaderService.rsocketObject = socket;

                socket.requestStream({
                    metadata: String.fromCharCode('monstersUpdate'.length) + 'monstersUpdate',
                }).subscribe({
                    onComplete: () => console.log('complete'),
                    onError: error => {
                        console.log(error);
                        this.state.next(SocketClientState.ERROR);
                    },
                    onNext: payload => {
                        this.monsterToUpdate.next(payload.data);
                    },
                    onSubscribe: subscription => {
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
                        const parsedPlayer: Player = playerToUpdate.data
                        // console.error(parsedPlayer);

                        const responseTimeInMillis = new Date().getTime() - Number(playerToUpdate.data.timestamp);
                        // console.error("Odpowiedz serwera " + responseTimeInMillis + " milliseconds")

                        this.measurementService.addMeasurementResponse(responseTimeInMillis, playerToUpdate.data.timestamp, parsedPlayer.version);

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
                    data: {
                        nickname: this.myNickname
                    },
                    metadata: String.fromCharCode('playerUpdateUser'.length) + 'playerUpdateUser',
                }).subscribe({
                    onComplete: () => console.log('complete'),
                    onError: error => {
                        console.log(error);
                        this.state.next(SocketClientState.ERROR);
                    },
                    onNext: playerToUpdate => {
                        console.error('Specific endpoint for player')
                        const parsedPlayer: Player = playerToUpdate.data;

                        const responseTimeInMillis = new Date().getTime() - Number(playerToUpdate.data.timestamp);

                        this.measurementService.addMeasurementResponse(responseTimeInMillis, playerToUpdate.data.timestamp, parsedPlayer.version);

                        const request = this.requestCache.getCorrectedPosition(parsedPlayer.version);
                        console.error(request);

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
                    onNext: payload => {
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
            onSubscribe: cancel => {
            }
        });
    }

    joinToGame(nickname: string) {
        this.rsocketObject
            .requestResponse({
                metadata: String.fromCharCode('joinToGame'.length) + 'joinToGame',
            }).subscribe({
            onComplete: currentCoinPosition => {
                this.ifJoinGame.next(currentCoinPosition.data);
            },
            onError: error => {
                console.log('got error with requestResponse');
                console.error(error);
                this.state.next(SocketClientState.ERROR);
            }
        });
    }

    sendPosition(data) {
        this.rsocketObject.fireAndForget({
            data,
            metadata: String.fromCharCode('sendPosition'.length) + 'sendPosition',
        });
    }

    addPlayer(nickname: string) {
        this.rsocketObject.fireAndForget({
            data: {
                nickname: nickname
            },
            metadata: String.fromCharCode('addNewPlayers'.length) + 'addNewPlayers',
        });
    }
}

// private sessionId = this.randomString(8, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
// private nickname = this.randomString(4, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');


// randomString(length, chars) {
//     let result = '';
//     for (let i = length; i > 0; --i) {
//         result += chars[Math.floor(Math.random() * chars.length)];
//     }
//     return result;
// }
