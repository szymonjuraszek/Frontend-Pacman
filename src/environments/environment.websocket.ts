import {WebsocketService} from "../app/communication/websocket/websocket.service";

export const environment = {
    production: false,
    serviceToCommunication: WebsocketService,
    download_measurement_rsocket: false
};
