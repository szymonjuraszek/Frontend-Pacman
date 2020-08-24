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
  }
}

