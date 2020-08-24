import {IFormatter} from "./IFormatter";
import {PlayerProto} from "../../../../proto/generated/proto/player_pb";
import {CoinProto} from "../../../../proto/generated/proto/coin_pb";
import {MonsterProto} from "../../../../proto/generated/proto/monster_pb";

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

    encode(data) {
        const playerProto = new PlayerProto();
        playerProto.setNickname(data.nickname);
        playerProto.setPositionX(data.positionX);
        playerProto.setPositionY(data.positionY);
        playerProto.setScore(data.score);
        playerProto.setStepDirection(data.stepDirection);
        playerProto.setVersion(data.version);

        return playerProto;
    }

}
