import {Injectable} from '@angular/core';
import {MeasurementResponse} from "../model/MeasurementResponse";
import {Request} from "../model/Request";
import {Player} from "../model/Player";
import { Queue } from 'queue-typescript';

@Injectable({
    providedIn: 'root'
})
export class RequestCacheService {

    private requests: Queue<Request> = new Queue<Request>();
    private _lastCorrectRequest: Request;
    private static _nickname: string;

    addRequest(id, x, y) {
        // if (this.requests.length > 1999) {
        //     this.requests.splice(0, 1);
        // }
        this.requests.enqueue(new Request(id, x, y));
    }

    getRequest(id) {
        if(this.requests.length > 0) {
            const request = this.requests.front;

            if(request.id > id) {
                return null;
            }
        }

        while (this.requests.length > 0) {
            const request = this.requests.dequeue();

            if(request.id === id) {
                this.lastCorrectRequest = request;
                return request;
            }
        }
        return null;
    }

    getCorrectedPosition(id) {
        if(this.requests.length > 0) {
            const request = this.requests.front;

            if(request.id > id) {
                return;
            }
        }

        while (this.requests.length > 0) {
            const request = this.requests.dequeue();

            if(request.id === id) {
                return this.lastCorrectRequest;
            }
        }
    }

    get lastCorrectRequest(): Request {
        return this._lastCorrectRequest;
    }

    set lastCorrectRequest(value: Request) {
        this._lastCorrectRequest = value;
    }

    static set nickname(value: string) {
        this._nickname = value;
    }
}
