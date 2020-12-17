import {WebsocketService} from "../app/communication/websocket/websocket.service";
import {ProtobufFormatter} from "../app/communication/format/ProtobufFormatter";

export const environment = {
    production: false,
    serviceToCommunication: WebsocketService,
    formatter: new ProtobufFormatter(),
    versionName: 'Websocket',
    contentFormat: 'protobuf',
    vpsServerUrl: 'ws://83.229.84.77:8080/socket',
    localServerUrl: 'ws://localhost:8080/socket'
};
