import {Injectable} from '@angular/core';
import {Communicator} from "../Communicator";
import {MeasurementService} from "../../cache/measurement.service";
import {BehaviorSubject} from "rxjs";
import {SocketClientState} from "../SocketClientState";
import {HttpClient, HttpHeaders, HttpResponse} from "@angular/common/http";
import {Coin} from "../../model/Coin";
import {Player} from "../../model/Player";
import {RequestCacheService} from "../../cache/request-cache.service";
import {HTTP_URL_MAIN} from "../../../../global-config";

@Injectable({
    providedIn: 'root'
})
export class Http2Service extends Communicator {
    private eventSource: EventSource;
    private nickname: string;

    constructor(private measurementService: MeasurementService, private http: HttpClient, private requestCache: RequestCacheService) {
        super(HTTP_URL_MAIN);
    }

    initializeConnection() {
        this.state = new BehaviorSubject<SocketClientState>(SocketClientState.CONNECTED);
    }

    disconnect() {
        console.error('Zakonczono komunikacje z serverem');
        if (this.eventSource.OPEN) {
            this.eventSource.close();
        }
        this.http.delete(this.serverUrl + "/emitter/" + this.nickname).subscribe(value => {
            console.error('Usunalem gracza');
        });
    }

    joinToGame(nickname: string) {
        this.http.get(this.serverUrl + "/player/" + nickname)
            .subscribe((ifExist: boolean) => {
                if (ifExist === false) {
                    this.nickname = nickname;
                    this.eventSource = new EventSource(this.serverUrl + "/emitter/" + this.nickname);

                    this.eventSource.addEventListener('/pacman/update/monster', (monsterPositionEvent: MessageEvent) => {
                        let monsterParsed = JSON.parse(monsterPositionEvent.data);
                        const responseTimeInMillis = new Date().getTime() - monsterParsed.requestTimestamp;
                        this.measurementService.addMonsterMeasurementWithTime(monsterParsed.id, monsterParsed.requestTimestamp, responseTimeInMillis);
                        this.monsterToUpdate.next(monsterParsed);
                    });
                    this.eventSource.addEventListener('/pacman/get/coin', (coinPositionEvent: MessageEvent) => {
                        console.error('Zbieram coina');
                        this.coinToGet.next(JSON.parse(coinPositionEvent.data));
                    });
                    this.eventSource.addEventListener('/pacman/refresh/coins', (updateMapEvent: MessageEvent) => {
                        console.error('Odswierzenie mapy');
                        this.refreshCoin.next(JSON.parse(updateMapEvent.data));
                    });
                    this.eventSource.addEventListener('/pacman/remove/player', (playerToRemoveEvent: MessageEvent) => {
                        console.error('Usuwam gracza!')
                        this.playerToRemove.next(JSON.parse(playerToRemoveEvent.data));
                    });
                    this.eventSource.addEventListener('/pacman/add/players', (playerToAddEvent: MessageEvent) => {
                        console.error('Dodaje gracza!')
                        this.playersToAdd.next(JSON.parse(playerToAddEvent.data));
                    });
                    this.eventSource.addEventListener('/pacman/update/player', (playerToUpdateEvent: MessageEvent) => {
                        const playersWithMeasurementInfo = JSON.parse(playerToUpdateEvent.data)
                        if (playersWithMeasurementInfo.player.nickname.match('first*') || playersWithMeasurementInfo.player.nickname === this.myNickname) {
                            this.saveResponseTime(playersWithMeasurementInfo.player.nickname,
                                playersWithMeasurementInfo.requestTimestamp,
                                playersWithMeasurementInfo.player.version,
                                playersWithMeasurementInfo.contentLength);
                        }

                        this.playerToUpdate.next(playersWithMeasurementInfo.player);
                    });

                    this.http.get(this.serverUrl + "/coins").subscribe((coinsPosition: Array<Coin>) => {
                        this.ifJoinGame.next(coinsPosition);
                    });
                } else {
                    this.ifJoinGame.next(new Array(0));
                }
            });
    }

    addPlayer(nickname: string) {
        const headers = new HttpHeaders().set('Content-Type', 'application/json');
        this.http.post(this.serverUrl + "/players", JSON.stringify(nickname), {headers: headers, observe: "response"})
            .subscribe((playerToAdd: HttpResponse<Array<Player>>) => {
                if (playerToAdd.status === 201) {
                    this.playersToAdd.next(playerToAdd.body);
                } else {
                    console.error('Nie udalo sie dodac uzytkownika')
                }
            });
    }

    sendPosition(data) {
        console.error(data)
        this.http.put(this.serverUrl + "/player", JSON.stringify(data), {
            headers: {
                'Content-Type': 'application/json',
                'requestTimestamp': new Date().getTime().toString()
            },
            observe: 'response'
        }).subscribe((player: HttpResponse<Player>) => {
            if (player.body.nickname.match('first*') || player.body.nickname === this.myNickname) {
                this.saveResponseTime(player.body.nickname,
                    Number(player.headers.get('requestTimestamp')),
                    player.body.version, Number(player.headers.get('content-length')));
            }

            if (player.status === 202) {
                const request = this.requestCache.getCorrectedPosition(player.body.version);

                if (request !== null) {
                    player.body.positionX = request.x;
                    player.body.positionY = request.y;
                    this.playerToUpdate.next(player.body);
                }
            } else if (player.status === 201) {
                const request = this.requestCache.getRequest(player.body.version);
                this.updateScore.next(player.body.score);

                if (request !== null && (request.x !== player.body.positionX || request.y !== player.body.positionY)) {
                    this.playerToUpdate.next(player.body);
                }
            } else if (player.status === 200) {
                this.playerToRemove.next(player.body);
            }
        });
    }

    saveResponseTime(id: string, timestampFromServer: number, version: number, size: number, ) {
        const responseTimeInMillis = new Date().getTime() - timestampFromServer;
        // console.error("Odpowiedz serwera " + responseTimeInMillis + " milliseconds");
        this.measurementService.addMeasurementResponse(id, responseTimeInMillis,
            Math.ceil((timestampFromServer - this.requestCache.timeForStartCommunication) / 1000),
            version, size, timestampFromServer);
    }
}
