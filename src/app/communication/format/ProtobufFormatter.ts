import {IFormatter} from "./IFormatter";
import {PlayerProto} from "../../../../proto/generated/proto/player_pb";
import {CoinProto} from "../../../../proto/generated/proto/coin_pb";
import {MonsterProto} from "../../../../proto/generated/proto/monster_pb";
import AdditionalData = PlayerProto.AdditionalData;

export class ProtobufFormatter implements IFormatter {
    newData = new Array<PlayerProto.AdditionalData>();

    decodeCoin(data) {
        return CoinProto.deserializeBinary(data.binaryBody).toObject();
    }

    decodeMonster(data) {
        return MonsterProto.deserializeBinary(data.binaryBody).toObject();
    }

    decodePlayer(data) {
        return PlayerProto.deserializeBinary(data.binaryBody).toObject();
    }

    encode(data): PlayerProto {
        const playerProto = new PlayerProto();

        playerProto.setNickname(data.nickname);
        playerProto.setPositionX(data.positionX);
        playerProto.setPositionY(data.positionY);
        playerProto.setScore(data.score);
        playerProto.setStepDirection(data.stepDirection);
        playerProto.setVersion(data.version);

        for (let i = this.newData.length; i < data.additionalData.length; i++) {
            const object = new AdditionalData();
            object.setText(data.additionalData[i].text);
            object.setNumber1(data.additionalData[i].number1)
            object.setNumber2(data.additionalData[i].number2)
            object.setNumber3(data.additionalData[i].number3)
            this.newData.push(object);
        }

        playerProto.setAdditionaldataList(this.newData);

        return playerProto;
    }

    prepareNicknamePayload(nickname: string) {
        return nickname;
    }
}
