import {RsocketService} from "../app/communication/rsocket/rsocket.service";
import {JsonFormatter} from "../app/communication/format/JsonFormatter";

export const environment = {
    production: false,
    serviceToCommunication: RsocketService,
    formatter: new JsonFormatter(),
    versionName: 'RSocket',
    contentFormat: 'json',
    vpsServerUrl: 'ws://83.229.84.77:8080/rsocket',
    localServerUrl: 'ws://localhost:8080/rsocket'
};
