import {Client} from "@stomp/stompjs";
import {IFormatter} from "../../format/IFormatter";
import {MeasurementService} from "../../../cache/measurement.service";
import {RequestCacheService} from "../../../cache/request-cache.service";
import {WEBSOCKET_URL_MAIN} from "../../../../../global-config";
import {CustomBinaryFormatter} from "../../format/CustomBinaryFormatter";
import {BehaviorSubject, interval} from "rxjs";
import {SocketClientState} from "../../SocketClientState";
import {JsonFormatter} from "../../format/JsonFormatter";
import {ProtobufFormatter} from "../../format/ProtobufFormatter";

export class WebsocketSimulationConnection {
    private additionalData = this.randomString(1000, '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ');
    private stompClient: Client;
    private formatter: IFormatter;
    private nick;


    randomString(length, chars) {
        let result = '';
        for (let i = length; i > 0; --i) {
            result += chars[Math.floor(Math.random() * chars.length)];
        }
        return result;
    }

    constructor(
        nick
    ) {
        this.nick = nick;
        this.setFormatter(new JsonFormatter());
    }

    initializeConnection(data,timeToSend) {
        this.stompClient = new Client({
            brokerURL: WEBSOCKET_URL_MAIN,
            debug: function (str) {
                console.log(str);
            },
            splitLargeFrames: true,
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000
        });

        this.stompClient.debug = () => {};

        this.stompClient.onConnect = () => {
            this.stompClient.subscribe('/pacman/add/players', (gameToAddPlayer) => {
            });

            this.stompClient.subscribe('/pacman/remove/player', (playerToRemove) => {
            });

            this.stompClient.subscribe('/pacman/update/player', (playerToUpdate) => {
            });

            this.stompClient.subscribe('/pacman/update/monster', (monster) => {
            });

            this.stompClient.subscribe('/pacman/refresh/coins', () => {
            });

            this.stompClient.subscribe('/pacman/get/coin', (coinPosition) => {
            });

            this.stompClient.subscribe('/user/queue/reply', (currentCoinPosition) => {
            });

            this.stompClient.subscribe('/user/queue/player', (playerToUpdate) => {
            });

            this.stompClient.subscribe('/pacman/collision/update', (allCoinPosition) => {
            });
        };

        this.stompClient.onStompError = (frame) => {
            console.log('Broker reported error: ' + frame.headers['message']);
            console.log('Additional details: ' + frame.body);
        };

        this.stompClient.activate();

        setTimeout(()=> {
            this.joinToGame(this.nick);
            this.addPlayer(this.nick);
        },2000)

        console.error('Zaczynam wysylac dane');

        var timesRun = 0;
        var strategy = true;
        // data.additionalData = this.additionalData;
        setTimeout(()=> {
            const sender = interval(20);
            sender.subscribe(()=> {
                timesRun += 1;
                if(timesRun === 150){
                    timesRun=0;
                    strategy=!strategy;
                }
                if(strategy) {
                    data.positionX -= 8;
                }else {
                    data.positionX += 8;
                }

                this.sendPosition(data);
            })
        },timeToSend)
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
