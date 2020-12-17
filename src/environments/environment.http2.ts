import {Http2Service} from "../app/communication/http2/http2.service";
import {JsonFormatter} from "../app/communication/format/JsonFormatter";

export const environment = {
    production: false,
    serviceToCommunication: Http2Service,
    formatter: new JsonFormatter(),
    versionName: 'HTTP2 + SSE',
    contentFormat: 'json',
    vpsServerUrl: 'https://83.229.84.77:8080',
    localServerUrl: 'https://localhost:8080'
};
