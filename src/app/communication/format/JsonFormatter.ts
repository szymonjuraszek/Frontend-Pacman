import {IFormatter} from "./IFormatter";

export class JsonFormatter implements IFormatter {
    decodeCoin(data) {
        return JSON.parse(data.body);
    }

    decodeMonster(data) {
        return JSON.parse(data.body);
    }

    decodePlayer(data) {
        return JSON.parse(data.body);
    }

    encode(data) {
        return data;
    }

    prepareNicknamePayload(nickname: string) {
        return {'nickname': nickname}
    }
}

