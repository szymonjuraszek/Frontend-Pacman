import {IFormatter} from "./IFormatter";
import {PlayerProto} from "../../../../proto/generated/proto/player_pb";
import {CoinProto} from "../../../../proto/generated/proto/coin_pb";
import {MonsterProto} from "../../../../proto/generated/proto/monster_pb";
import AdditionalData = PlayerProto.AdditionalData;

export class ProtobufFormatter implements IFormatter{
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

        // const newData: Array<AdditionalData> = new Array<AdditionalData>(data.additionalData.length);
        //
        // for (let i = 0; i<data.additionalData.length;i++) {
        //     newData[i] = new AdditionalData();
        //     newData[i].setText(data.additionalData[i].text);
        //     newData[i].setNumber1(data.additionalData[i].number1)
        //     newData[i].setNumber2(data.additionalData[i].number2)
        //     newData[i].setNumber3(data.additionalData[i].number3)
        // }
        //
        // playerProto.setAdditionaldataList(newData);

        return playerProto;
    }

    prepareNicknamePayload(nickname: string) {
        return nickname;
    }
}
