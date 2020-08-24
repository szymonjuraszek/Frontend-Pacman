// package: 
// file: proto/coin.proto

import * as jspb from "google-protobuf";

export class CoinProto extends jspb.Message {
  getPositionX(): number;
  setPositionX(value: number): void;

  getPositionY(): number;
  setPositionY(value: number): void;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): CoinProto.AsObject;
  static toObject(includeInstance: boolean, msg: CoinProto): CoinProto.AsObject;
  static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
  static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
  static serializeBinaryToWriter(message: CoinProto, writer: jspb.BinaryWriter): void;
  static deserializeBinary(bytes: Uint8Array): CoinProto;
  static deserializeBinaryFromReader(message: CoinProto, reader: jspb.BinaryReader): CoinProto;
}

export namespace CoinProto {
  export type AsObject = {
    positionX: number,
    positionY: number,
  }
}

