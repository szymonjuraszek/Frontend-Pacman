// package: 
// file: proto/player.proto

import * as jspb from "google-protobuf";

export class PlayerProto extends jspb.Message {
  getNickname(): string;
  setNickname(value: string): void;

  getPositionX(): number;
  setPositionX(value: number): void;

  getPositionY(): number;
  setPositionY(value: number): void;

  getScore(): number;
  setScore(value: number): void;

  getStepDirection(): string;
  setStepDirection(value: string): void;

  getVersion(): number;
  setVersion(value: number): void;

  clearAdditionaldataList(): void;
  getAdditionaldataList(): Array<PlayerProto.AdditionalData>;
  setAdditionaldataList(value: Array<PlayerProto.AdditionalData>): void;
  addAdditionaldata(value?: PlayerProto.AdditionalData, index?: number): PlayerProto.AdditionalData;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): PlayerProto.AsObject;
  static toObject(includeInstance: boolean, msg: PlayerProto): PlayerProto.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: PlayerProto, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): PlayerProto;
  static deserializeBinaryFromReader(message: PlayerProto, reader: jspb.BinaryReader): PlayerProto;
}

export namespace PlayerProto {
  export type AsObject = {
    nickname: string,
    positionX: number,
    positionY: number,
    score: number,
    stepDirection: string,
    version: number,
    additionaldataList: Array<PlayerProto.AdditionalData.AsObject>,
  }

  export class AdditionalData extends jspb.Message {
    getText(): string;
    setText(value: string): void;

    getNumber1(): number;
    setNumber1(value: number): void;

    getNumber2(): number;
    setNumber2(value: number): void;

    getNumber3(): number;
    setNumber3(value: number): void;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): AdditionalData.AsObject;
    static toObject(includeInstance: boolean, msg: AdditionalData): AdditionalData.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: AdditionalData, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): AdditionalData;
    static deserializeBinaryFromReader(message: AdditionalData, reader: jspb.BinaryReader): AdditionalData;
  }

  export namespace AdditionalData {
    export type AsObject = {
      text: string,
      number1: number,
      number2: number,
      number3: number,
    }
  }
}

