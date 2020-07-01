import {Injectable} from '@angular/core';
import {Communicator} from "../Communicator";
import {Direction} from "../Direction";
import {MeasurementService} from "../../cache/measurement.service";
import RSocketWebSocketClient from 'rsocket-websocket-client';
// import RSocketTcpClient from 'rsocket-tcp-client';
import {IdentitySerializer, JsonSerializer, RSocketClient} from 'rsocket-core';
import {BehaviorSubject} from "rxjs";
import {SocketClientState} from "../SocketClientState";

@Injectable({
    providedIn: 'root'
})
export class RsocketService extends Communicator {
    private readonly client: RSocketClient;

    constructor(private measurementService: MeasurementService) {
        super('ws://localhost:7000/rsocket');

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
            },
            transport: new RSocketWebSocketClient({
                url: this.serverUrl
            }),
        });
    }

    addPlayer(nickname: string) {
    }

    disconnect() {
    }

    getCoinToGet() {
    }

    getIfJoinGame() {
    }

    getMonsterToUpdate() {
    }

    getPlayerToRemove() {
    }

    getPlayerToUpdate() {
    }

    getPlayersToAdd() {
    }

    getRefreshCoins() {
    }

    getState() {
    }

    initializeConnection() {
        this.state = new BehaviorSubject<SocketClientState>(SocketClientState.ATTEMPTING);

        this.client.connect().subscribe({
            onComplete: socket => {

                // console.error(socket);
                console.error('Show info bout this.client');
                console.log(this.client);
                // socket provides the rsocket interactions fire/forget, request/response,
                // request/stream, etc as well as methods to close the socket.
                socket.requestStream({
                    data: {
                        author: 'linustorvalds'
                    },
                    metadata: String.fromCharCode('tweets'.length) + 'tweets',
                }).subscribe({
                    onComplete: () => console.log('complete'),
                    onError: error => {
                        console.log(error);
                        // addErrorMessage("Connection has been closed due to ", error);
                    },
                    onNext: payload => {
                        console.log(payload.data);
                        console.log('reaguje na otrzymane dane');
                        // addMessage(payload.data);
                    },
                    onSubscribe: subscription => {
                        console.error('I subscribe request stream');
                        console.error(subscription);
                        subscription.request(2147483647);
                    },
                });

                // Request - Response
                const message = {message: 'requestResponse from JavaScript!'};
                socket
                    .requestResponse({
                        data: message,
                        metadata: String.fromCharCode('tweets1'.length) + 'tweets1',
                    })
                    .subscribe({
                        onComplete: data => {
                            console.log('got response with requestResponse');
                            this.client.received.push(data.data);
                        },
                        onError: error => {
                            console.log('got error with requestResponse');
                            console.error(error);
                        },
                        onSubscribe: cancel => {
                            this.client.sent.push(message);
                            /* call cancel() to stop onComplete/onError */
                        }
                    });
            },
            onError: error => {
                console.log(error);
            },
            onSubscribe: cancel => {
                /* call cancel() to abort */
            }
        });
    }

    joinToGame(nickname: string) {
    }

    sendPosition(x: number, y: number, nickname: string, score: number, stepDirection: Direction) {
    }
}
