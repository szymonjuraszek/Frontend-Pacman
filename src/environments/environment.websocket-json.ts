import {WebsocketService} from "../app/communication/websocket/websocket.service";
import {JsonFormatter} from "../app/communication/format/JsonFormatter";

export const environment = {
    production: false,
    serviceToCommunication: WebsocketService,
    formatter: new JsonFormatter(),
    versionName: 'Websocket',
    contentFormat: 'json',
    vpsServerUrl: 'ws://83.229.84.77:8080/socket',
    localServerUrl: 'ws://localhost:8080/socket'

};
