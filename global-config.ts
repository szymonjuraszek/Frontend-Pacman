'use strict';
// Not modify
export enum Format {
    CUSTOM_BINARY,
    PROTOBUF,
    JSON
}

// Define data which will be saved into response file (not modify)
export const CSV_RESPONSE_HEADERS = ['response_time_in_millis', 'response_timestamp', 'version_response'];

//-----------------------   Global options for application which you can modify    -------------------------
// 1) URLS
// URL for measurement file (request file)
export const HTTP_URL_DOWNLOAD = 'http://localhost:7000/report/measurement';
// domain for server (http2)
export const HTTP_URL_MAIN = 'https://localhost:8080';
// websocket(stomp) URL for connection
export const WEBSOCKET_URL_MAIN = 'ws://localhost:8080/socket';
// rsocket(websocket) URL for connection
export const RSOCKET_URL_MAIN = 'ws://localhost:7000/rsocket';

// 2) This option must be set on 'true' for rsocket
export const DOWNLOAD_MEASUREMENT_RSOCKET = true
