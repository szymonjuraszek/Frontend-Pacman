import {IFormatter} from "../../format/IFormatter";
import {RSOCKET_URL_MAIN} from "../../../../../global-config";

import RSocketWebSocketClient from 'rsocket-websocket-client';
import {IdentitySerializer, JsonSerializer, RSocketClient} from 'rsocket-core';
import {BehaviorSubject, interval} from "rxjs";

import {Communicator} from "../../Communicator";
import {MeasurementService} from "../../../cache/measurement.service";
import {RequestCacheService} from "../../../cache/request-cache.service";
import {DownloadService} from "../../../downloader/download.service";
import {ProtobufFormatter} from "../../format/ProtobufFormatter";
import {SocketClientState} from "../../SocketClientState";
import {Player} from "../../../model/Player";
import set = Reflect.set;

export class RSocketSimulationConnection {
    private additionalData = this.randomString(1000, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
    private formatter: IFormatter;
    private numberRandom = Math.floor(Math.random() * 10000) + 1;
    private nick;

    randomString(length, chars) {
        let result = '';
        for (let i = length; i > 0; --i) {
            result += chars[Math.floor(Math.random() * chars.length)];
        }
        return result;
    }


    private client: RSocketClient<any, string | Buffer | Uint8Array>;
    private rsocketObject: any;

    private coinRefreshSub: any;
    private coinGetSub: any;
    private monstersUpdateSub: any;
    private playersAddedSub: any;
    private playerRemoveSub: any;
    private playerUpdateSub: any;
    private playerUpdateUserSub: any;

    constructor(nick) {
        this.nick = nick;
    }

    disconnect() {
        this.coinGetSub.cancel();
        this.monstersUpdateSub.cancel();
        this.playersAddedSub.cancel();
        this.playerRemoveSub.cancel();
        this.playerUpdateSub.cancel();
        this.playerUpdateUserSub.cancel();

        this.rsocketObject.fireAndForget({
            data: {
                'nickname': this.nick
            },
            metadata: String.fromCharCode('disconnect'.length) + 'disconnect',
        });
        this.client.close();
    }

    initializeConnection(data, timeToSend) {
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
                        nickname: this.nick
                    }
                },
            },
            transport: new RSocketWebSocketClient({
                url: RSOCKET_URL_MAIN
            }),
        });

        this.client.connect().subscribe({
            onComplete: socket => {

                this.rsocketObject = socket;

                socket.requestStream({
                    metadata: String.fromCharCode('monstersUpdate'.length) + 'monstersUpdate',
                }).subscribe({
                    onComplete: () => console.log('complete'),
                    onError: error => {
                        console.log(error);
                    },
                    onNext: payload => {
                    },
                    onSubscribe: subscription => {
                        console.error('========= Subskrybuje monsterUpdate ============')
                        subscription.request(this.numberRandom);
                        this.monstersUpdateSub = subscription;
                    }
                });

                socket.requestStream({
                    metadata: String.fromCharCode('playersAdded'.length) + 'playersAdded',
                }).subscribe({
                    onComplete: () => console.log('complete'),
                    onError: error => {
                        console.log(error);
                    },
                    onNext: payload => {
                    },
                    onSubscribe: subscription => {
                        console.error('======== Subskrybuje playersAdded ===========')
                        subscription.request(this.numberRandom+ 1);
                        this.playersAddedSub = subscription;
                    },
                });

                socket.requestStream({
                    metadata: String.fromCharCode('playerRemove'.length) + 'playerRemove',
                }).subscribe({
                    onComplete: () => console.log('complete'),
                    onError: error => {
                        console.log(error);
                    },
                    onNext: payload => {
                    },
                    onSubscribe: subscription => {
                        console.error('========= Subskrybuje playerRemove ============')
                        subscription.request(this.numberRandom+2);
                        this.playerRemoveSub = subscription;
                    },
                });

                socket.requestStream({
                    metadata: String.fromCharCode('playerUpdate'.length) + 'playerUpdate',
                }).subscribe({
                    onComplete: () => console.log('complete'),
                    onError: error => {
                        console.log(error);
                    },
                    onNext: playerToUpdate => {
                    },
                    onSubscribe: subscription => {
                        console.error('========= Subskrybuje playerUpdate ============')
                        subscription.request(this.numberRandom+3);
                        this.playerUpdateSub = subscription;
                    },
                });

                socket.requestStream({
                    data: {
                        nickname: this.nick
                    },
                    metadata: String.fromCharCode('playerUpdateUser'.length) + 'playerUpdateUser',
                }).subscribe({
                    onComplete: () => console.log('complete'),
                    onError: error => {
                        console.log(error);
                    },
                    onNext: playerToUpdate => {
                    },
                    onSubscribe: subscription => {
                        console.error('========= Subskrybuje specificPlayerUpdate ============')
                        subscription.request(this.numberRandom+4);
                        this.playerUpdateUserSub = subscription;
                    },
                });

                socket.requestStream({
                    metadata: String.fromCharCode('coinGet'.length) + 'coinGet',
                }).subscribe({
                    onComplete: () => console.log('complete'),
                    onError: error => {
                    },
                    onNext: payload => {
                    },
                    onSubscribe: subscription => {
                        console.error('========= Subskrybuje coinGet ============')
                        subscription.request(this.numberRandom+5);
                        this.coinGetSub = subscription;
                    },
                });
            },
            onError: error => {
                console.log(error);
            },
            onSubscribe: cancel => {
            }
        });

        setTimeout(()=> {
            this.joinToGame(this.nick);
            this.addPlayer(this.nick);
        },2000)

        console.error('Zaczynam wysylac dane');

        var timesRun = 0;
        var strategy = true;
        data.additionalData = this.additionalData;
        setTimeout(()=> {
            const sender = interval(20);
            const sth = sender.subscribe(()=> {
                timesRun += 1;
                if(timesRun === 300){
                    timesRun=0;
                    strategy=!strategy;
                }
                if(strategy) {
                    data.positionX -= 4;
                }else {
                    data.positionX += 4;
                }

                this.sendPosition(data);
            })
        },timeToSend)
    }

    joinToGame(nickname: string) {
        this.rsocketObject
            .requestResponse({
                metadata: String.fromCharCode('joinToGame'.length) + 'joinToGame',
            }).subscribe({
            onComplete: currentCoinPosition => {
            },
            onError: error => {
                console.log('got error with requestResponse');
                console.error(error);
            }
        });
    }

    sendPosition(data) {
        // const dataWithSpecificFormat = this.formatter.encode(dataToSend);
        // if (this.formatter instanceof ProtobufFormatter) {
        //
        // } else {
        data.requestTimestamp = new Date().getTime();
        this.rsocketObject.fireAndForget({
            data,
            metadata: String.fromCharCode('sendPosition'.length) + 'sendPosition',
        });
        // }
    }

    addPlayer(nickname: string) {
        this.rsocketObject.fireAndForget({
            data: {
                nickname: this.nick
            },
            metadata: String.fromCharCode('addNewPlayers'.length) + 'addNewPlayers',
        });
    }
}
