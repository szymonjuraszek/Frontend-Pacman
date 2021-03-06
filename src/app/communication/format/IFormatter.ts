export interface IFormatter {
    decodePlayer(data);
    decodeCoin(data);
    decodeMonster(data);
    encode(data);
    prepareNicknamePayload(nickname: string);
}
