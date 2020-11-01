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
        return {
            "nickname": this.textDecoder.decode(view.buffer.slice(0, 10)).trim(),
            "positionX": view.getInt16(10),
            "positionY": view.getInt16(12),
            "score": view.getInt16(14),
            "version": view.getInt16(16),
            "stepDirection": this.textDecoder.decode(view.buffer.slice(18, 20))
        };
    }

    encode(data) {
        //Nickname encode
        const nicknameBinary = new Uint8Array(10);
        for (let i = 0, strLen = data.nickname.length; i < strLen; i++) {
            nicknameBinary[i] = data.nickname.charCodeAt(i);
        }

        // data about user encode (numbers)
        const numbersToSend = new Int16Array(4);
        numbersToSend[0] = data.positionX;
        numbersToSend[1] = data.positionY;
        numbersToSend[2] = data.score;
        numbersToSend[3] = data.version;
        const numbersBinary = new Uint8Array(numbersToSend.buffer);

        // direction  encode
        const directionBinary = new Uint8Array(3);
        for (let i = 0, strLen = data.stepDirection.toString().length; i < strLen; i++) {
            directionBinary[i] = data.stepDirection.toString().charCodeAt(i);
        }

        const dataToSend = new Uint8Array(nicknameBinary.length + numbersBinary.length + directionBinary.length);
        dataToSend.set(nicknameBinary, 0);
        dataToSend.set(new Uint8Array(numbersToSend.buffer), nicknameBinary.length);
        dataToSend.set(directionBinary, numbersBinary.length + nicknameBinary.length);

        return dataToSend;
    }

    prepareNicknamePayload(nickname: string) {
        throw new Error("Method not implemented.");
    }
}
