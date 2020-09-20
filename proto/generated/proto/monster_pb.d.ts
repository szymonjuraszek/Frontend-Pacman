// package: 
// file: proto/monster.proto

import * as jspb from "google-protobuf";

export class MonsterProto extends jspb.Message {
  getId(): number;
  setId(value: number): void;

  getPositionX(): number;
  setPositionX(value: number): void;

  getPositionY(): number;
  setPositionY(value: number): void;

  getPreviousDirection(): string;
  setPreviousDirection(value: string): void;

  getTimestamp(): number;
  setTimestamp(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MonsterProto.AsObject;
  static toObject(includeInstance: boolean, msg: MonsterProto): MonsterProto.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: MonsterProto, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): MonsterProto;
  static deserializeBinaryFromReader(message: MonsterProto, reader: jspb.BinaryReader): MonsterProto;
}

export namespace MonsterProto {
  export type AsObject = {
    id: number,
    positionX: number,
    positionY: number,
    previousDirection: string,
    timestamp: number,
  }
}

