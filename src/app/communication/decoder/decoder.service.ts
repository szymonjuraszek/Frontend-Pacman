import {Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class DecoderService {
    private textDecoder = new TextDecoder("utf-8");

    constructor() {
    }

    decodePlayer(playerToDecode) {
        if (playerToDecode.headers['content-type'] === 'application/octet-stream') {
            const view = new DataView(playerToDecode.binaryBody.buffer);
            return {
                "nickname": this.textDecoder.decode(view.buffer.slice(0, 10)).trim(),
                "positionX": view.getInt16(10),
                "positionY": view.getInt16(12),
                "score": view.getInt16(14),
                "version": view.getInt16(16)
            };
        } else {
            return JSON.parse(playerToDecode.body);
        }
    }

    decodeMonster(monsterToDecode) {
        if (monsterToDecode.headers['content-type'] === 'application/octet-stream') {
            const view = new DataView(monsterToDecode.binaryBody.buffer);
            return {
                "id": view.getInt16(0),
                "positionX": view.getInt16(2),
                "positionY": view.getInt16(4),
            };
        } else {
            return JSON.parse(monsterToDecode.body);
        }
    }

    decodeCoin(coinToDecode) {
        if (coinToDecode.headers['content-type'] === 'application/octet-stream') {
            const view = new DataView(coinToDecode.binaryBody.buffer);
            return {
                "positionX": view.getInt16(0),
                "positionY": view.getInt16(2),
            };
        } else {
            return JSON.parse(coinToDecode.body);
        }
    }
}
