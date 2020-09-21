import {RsocketService} from "../app/communication/rsocket/rsocket.service";

export const environment = {
    production: false,
    serviceToCommunication: RsocketService,
    download_measurement_rsocket: true
};
