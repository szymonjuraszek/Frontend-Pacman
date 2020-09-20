import {IFormatter} from "./IFormatter";

export class CustomBinaryFormatter implements IFormatter {
    private textDecoder = new TextDecoder("utf-8");

    decodeCoin(coinToDecode) {
        const view = new DataView(coinToDecode.binaryBody.buffer);
        return {
            "positionX": view.getInt16(0),
            "positionY": view.getInt16(2),
        };
    }

    decodeMonster(monsterToDecode) {
        const view = new DataView(monsterToDecode.binaryBody.buffer);
        return {
            "id": view.getInt16(0),
            "positionX": view.getInt16(2),
            "positionY": view.getInt16(4),
        };
    }

    decodePlayer(playerToDecode) {
        const view = new DataView(playerToDecode.binaryBody.buffer);
        console.error('Jestem tu');
        return {
            "nickname": this.textDecoder.decode(view.buffer.slice(0, 10)).trim(),
            "positionX": view.getInt16(10),
            "positionY": view.getInt16(12),
            "score": view.getInt16(14),
            "version": view.getInt16(16)
        };
    }

    encode(data) {
        const numbersToSend = new Int16Array(4);
        numbersToSend[0] = data.positionX;
        numbersToSend[1] = data.positionY;
        numbersToSend[2] = data.score;
        numbersToSend[3] = data.version;
        const b = new Uint8Array(numbersToSend.buffer);

        const textToSend = data.nickname + '|' + data.stepDirection.toString();
        const a = new Uint8Array(19);
        for (let i = 0, strLen = textToSend.length; i < strLen; i++) {
            a[i] = textToSend.charCodeAt(i);
        }

        //join two Uint8array
        const dataToSend = new Uint8Array(a.length + b.length);
        dataToSend.set(a);
        dataToSend.set(new Uint8Array(numbersToSend.buffer), a.length);

        return dataToSend;
    }

    prepareNicknamePayload(nickname: string) {
        throw new Error("Method not implemented.");
    }
}
