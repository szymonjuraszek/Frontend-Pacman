import {Injectable} from '@angular/core';
import {Communicator} from "../Communicator";
import {Direction} from "../Direction";
import {MeasurementService} from "../../cache/measurement.service";
import RSocketWebSocketClient from 'rsocket-websocket-client';
import {Flowable, Single, every} from 'rsocket-flowable';
// import RSocketTcpClient from 'rsocket-tcp-client';
import {IdentitySerializer, JsonSerializer, RSocketClient, Lease} from 'rsocket-core';
import {BehaviorSubject} from "rxjs";
import {SocketClientState} from "../SocketClientState";
import {Responder, Payload} from 'rsocket-types';


function make(data: string): Payload<string, string> {
    return {
        data,
        metadata: '',
    };
}

function logRequest(type: string, payload: Payload<string, string>) {
    console.log(`Responder response to ${type}, data: ${payload.data || 'null'}`);
}

class EchoResponder implements Responder<string, string>{
    private callback: any;
    constructor(callback) {
        this.callback = callback;
    }
    fireAndForget(payload) {
        console.error('Jestem w fire and forget')
        this.callback(payload);
    }
    requestResponse(payload): Single<Payload<string, string>> {
        logRequest('request-response', payload);
        return Single.of(make('client response'));
    }
    // metadataPush(payload: Payload<string, string>): Single<void> {
    //     return Single.error(new Error('not implemented'));
    // }
    //
    // fireAndForget(payload: Payload<string, string>): void {
    //     logRequest('fire-and-forget', payload);
    // }
    //
    // requestResponse(
    //     payload: Payload<string, string>,
    // ): Single<Payload<string, string>> {
    //     logRequest('request-response', payload);
    //     return Single.of(make('client response'));
    // }
    //
    // requestStream(
    //     payload: Payload<string, string>,
    // ): Flowable<Payload<string, string>> {
    //     logRequest('request-stream', payload);
    //     return Flowable.just(make('client stream response'));
    // }
    //
    // requestChannel(
    //     payloads: Flowable<Payload<string, string>>,
    // ): Flowable<Payload<string, string>> {
    //     return Flowable.just(make('client channel response'));
    // }
}

// const receivedLeasesLogger: (Flowable<Lease>) = (lease) =>
//     lease.subscribe({
//         onSubscribe: s => s.request(Number.MAX_SAFE_INTEGER),
//         onNext: lease =>
//             console.log(
//                 `Received lease - ttl: ${lease.timeToLiveMillis}, requests: ${lease.allowedRequests}`,
//             ),
//     });
//
// function periodicLeaseSender(
//     intervalMillis: number,
//     ttl: number,
//     allowedRequests: number,
// ): Flowable<Lease> {
//     return every(intervalMillis).map(v => {
//         console.log(`Sent lease - ttl: ${ttl}, requests: ${allowedRequests}`);
//         return new Lease(ttl, allowedRequests);
//     });
// }



@Injectable({
    providedIn: 'root'
})
export class RsocketService extends Communicator {
    private readonly client: RSocketClient;
    private sessionId = this.randomString(8, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
    private nickname = this.randomString(4, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');

    private rsocketObject: RSocketWebSocketClient;

    randomString(length, chars) {
        let result = '';
        for (let i = length; i > 0; --i) {
            result += chars[Math.floor(Math.random() * chars.length)];
        }
        return result;
    }

    constructor(private measurementService: MeasurementService) {
        super('ws://localhost:7000/rsocket');
        const messageReceiver = payload => {
            //do what you want to do with received message
            console.error('Wyswietlam info ');
            console.log(payload)
        };

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
                        sessionId: this.sessionId,
                        nickname: this.nickname
                    }
                },
            },
            responder: new EchoResponder(messageReceiver),
            // leases: () => {
            //     console.error('Jestem w leases');
            // }
            // ,
            transport: new RSocketWebSocketClient({
                url: this.serverUrl
            }),
        });
    }

    disconnect() {
    }

    initializeConnection() {
        this.state = new BehaviorSubject<SocketClientState>(SocketClientState.ATTEMPTING);

        this.client.connect().subscribe({
            onComplete: socket => {

                this.rsocketObject = socket;

                socket.requestStream({
                    data: {
                        'author': 'linustorvalds'
                    },
                    metadata: String.fromCharCode('tweets'.length) + 'tweets',
                }).subscribe({
                    onComplete: () => console.log('complete'),
                    onError: error => {
                        console.log(error);
                    },
                    onNext: payload => {
                        console.log(payload.data);
                        // console.error(socket);
                    },
                    onSubscribe: subscription => {
                        console.error('Subskrybuje')
                        subscription.request(2147483647);
                    },
                });

                this.state.next(SocketClientState.CONNECTED);
            },
            onError: error => {
                console.log(error);
                this.state.next(SocketClientState.ERROR);
            },
            onSubscribe: cancel => {
                /* call cancel() to abort */
            }
        });
    }

    joinToGame(nickname: string) {
        console.error('Jestem w joinToGame()')
        this.rsocketObject
            .requestResponse({
                data: {
                    nickname: nickname
                },
                metadata: String.fromCharCode('joinToGame'.length) + 'joinToGame',
            }).subscribe({
            onComplete: currentCoinPosition => {
                console.error('fdsfdsfdsfdsfdsfsdf')
                console.error(currentCoinPosition);
                this.ifJoinGame.next(currentCoinPosition.data);
            },
            onError: error => {
                console.log('got error with requestResponse');
                console.error(error);
            },
            onSubscribe: cancel => {
            }
        });
    }

    sendPosition(x: number, y: number, nickname: string, score: number, stepDirection: Direction) {

        // this.rsocketObject.requestStream({
        //     data: 'ljklkjl',
        //     metadata: String.fromCharCode('monster'.length) + 'monster',
        // }).subscribe({
        //     onComplete: () => console.log('complete'),
        //     onError: error => {
        //         console.log(error);
        //     },
        //     onNext: payload => {
        //         console.error('Cos tam')
        //         console.log(payload.data);
        //     },
        //     onSubscribe: subscription => {
        //         console.error('Subskrybuje example')
        //         subscription.request(200);
        //     },
        // });




        const flowablePayload = new Flowable(subscriber => {
            subscriber.onSubscribe({
                cancel: () => {
                },
                request: n => {
                    console.error('Robie requesta');
                        const message = {
                                nickname: nickname,
                                positionX: x,
                                positionY: y,
                                score: score,
                                stepDirection: stepDirection,
                                requestTimestamp: new Date().getTime()
                            };
                        subscriber.onNext(message);
                    subscriber.onComplete();
                }
            });
        });

        this.rsocketObject
            .requestChannel(
                Flowable.just({
                    data: {
                        nickname: 'sajmon',
                        positionX: 12,
                        positionY: 13,
                        score: 99,
                        stepDirection: Direction.VERTICAL,
                        requestTimestamp: new Date().getTime()
                    },
                    metadata: String.fromCharCode('example'.length) + 'example',
                }))
            .subscribe({
                onComplete: () => {
                    console.log("requestChannel done");
                },
                onError: error => {
                    console.log("got error with requestChannel");
                    console.error(error);
                },
                onNext: value => {
                    console.log("got next value in requestChannel..");
                    console.error(value);
                },
                // Nothing happens until `request(n)` is called
                onSubscribe: sub => {
                    console.log("subscribe request Channel!");
                    // console.error(sub);
                    sub.request(10);
                }
            });

        console.error('Wysylam pozycje');

    }

    addPlayer(nickname: string) {
        this.rsocketObject.requestStream({
            data: {
                nickname: nickname
            },
            metadata: String.fromCharCode('addNewPlayers'.length) + 'addNewPlayers',
        }).subscribe({
            onComplete: () => console.log('complete'),
            onError: error => {
                console.log(error);
            },
            onNext: gameToAddPlayer => {
                console.log('reaguje na otrzymane dane');
                console.log(gameToAddPlayer.data);
                this.playersToAdd.next(gameToAddPlayer.data);
            },
            onSubscribe: subscription => {
                console.error('I subscribe request stream');
                console.error(subscription);
                subscription.request(2147483647);
            },
        });
    }
}
