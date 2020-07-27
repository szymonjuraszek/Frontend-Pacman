import {Injectable} from '@angular/core';
import {Communicator} from "../Communicator";
import {MeasurementService} from "../../cache/measurement.service";
import {Direction} from "../Direction";
import {BehaviorSubject} from "rxjs";
import {SocketClientState} from "../SocketClientState";
import {HttpClient, HttpHeaders, HttpParams, HttpResponse} from "@angular/common/http";
import {Coin} from "../../model/Coin";
import {Player} from "../../model/Player";
import {version} from "punycode";

@Injectable({
    providedIn: 'root'
})
export class Http2Service extends Communicator {
    private eventSource: EventSource;
    private nickname: string;

    constructor(private measurementService: MeasurementService, private http: HttpClient) {
        super('https://localhost:8080');
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
                        this.monsterToUpdate.next(JSON.parse(monsterPositionEvent.data));
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
                        console.error('Update gracza!')
                        let obj = JSON.parse(playerToUpdateEvent.data);
                        this.saveResponseTime(obj.timestamp);
                        this.playerToUpdate.next(JSON.parse(playerToUpdateEvent.data));
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

    sendPosition(x: number, y: number, nickname: string, score: number, stepDirection: Direction) {
        this.http.put(this.serverUrl + "/player", JSON.stringify({
            "nickname": nickname,
            "positionX": x,
            "positionY": y,
            "score": score,
            "stepDirection": stepDirection
        }), {
            headers: {
                'Content-Type': 'application/json',
                'requestTimestamp': new Date().getTime().toString()
            },
            observe: 'response'
        }).subscribe((player: HttpResponse<Player>) => {
            this.saveResponseTime(Number(player.headers.get('timestamp')));

            if (player.status === 202) {
                this.playerToUpdate.next(player.body);
            } else if (player.status === 200 && player.body !== null) {
                this.playerToRemove.next(player.body);
            } else if (player.status === 200) {
                console.error('Nic nie robie');
            }
        });
    }

    saveResponseTime(timestampFromServer: number) {
        const responseTimeInMillis = new Date().getTime() - timestampFromServer;
        console.error("Odpowiedz serwera " + responseTimeInMillis + " milliseconds")
        this.measurementService.addMeasurementResponse(responseTimeInMillis, timestampFromServer, version);
    }
}
