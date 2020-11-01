import {BehaviorSubject, Subject} from "rxjs";
import {SocketClientState} from "./SocketClientState";
import {Player} from "../model/Player";
import {Monster} from "../model/Monster";
import {Coin} from "../model/Coin";

export abstract class Communicator {
    protected serverUrl;
    protected state: BehaviorSubject<SocketClientState>;
    private _myNickname;

    protected playersToAdd = new Subject<Array<Player>>();
    protected playerToRemove = new Subject<Player>();
    protected playerToUpdate = new Subject<Player>();
    protected monsterToUpdate = new Subject<Monster>();
    protected ifJoinGame = new Subject<any>();

    protected coinToGet = new Subject<Coin>();
    protected updateScore = new Subject<number>();
    protected refreshCoin = new Subject<Coin>();

    protected constructor(serverUrl) {
        this.serverUrl = serverUrl;
    }

    abstract initializeConnection();
    abstract disconnect();
    abstract sendPosition(data);
    abstract joinToGame(nickname: string);
    abstract addPlayer(nickname: string);


    getState() {
        return this.state.asObservable();
    }

    getPlayersToAdd() {
        return this.playersToAdd.asObservable();
    }

    getPlayerToRemove() {
        return this.playerToRemove.asObservable();
    }

    getPlayerToUpdate() {
        return this.playerToUpdate.asObservable();
    }

    getMonsterToUpdate() {
        return this.monsterToUpdate.asObservable();
    }

    getIfJoinGame() {
        return this.ifJoinGame.asObservable();
    }

    getCoinToGet() {
        return this.coinToGet.asObservable();
    }

    getRefreshCoins() {
        return this.refreshCoin.asObservable();
    }

    get myNickname() {
        return this._myNickname;
    }

    set myNickname(value) {
        this._myNickname = value;
    }

    getUpdateScore() {
        return this.updateScore.asObservable();
    }
}
