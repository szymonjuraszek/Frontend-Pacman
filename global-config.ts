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
// domain for server (it is used for http2 only)
export const HTTP_URL_MAIN = 'https://localhost:8080';
// URL for measurement file (request file)
export const HTTP_URL_DOWNLOAD = 'http://localhost:8080/report/measurement';
// websocket(stomp) URL for connection
export const WEBSOCKET_URL_MAIN = 'ws://localhost:8080/socket';
