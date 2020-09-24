'use strict';

import {IdentitySerializer, JsonSerializer} from 'rsocket-core';

// Defined data which will be saved into response file (not modify)
export const CSV_RESPONSE_HEADERS = ['id', 'response_time_in_millis', 'request_timestamp', 'version_response', 'size'];

//-----------------------   Global options for application which you can modify    -------------------------
// 1) URLS
// domain for server (http2)
export const HTTP_URL_MAIN = 'https://localhost:8080';
// export const HTTP_URL_MAIN = 'https://http2-pacman.herokuapp.com';
// websocket(stomp) URL for connection
export const WEBSOCKET_URL_MAIN = 'ws://localhost:8080/socket';
// export const WEBSOCKET_URL_MAIN = 'wss://pacman-websocket.herokuapp.com/socket';
// rsocket(websocket) URL for connection
export const RSOCKET_URL_MAIN =  'ws://localhost:8080/rsocket';

// 3) Serializer for RSocket
export const SERIALIZER_DATA = JsonSerializer
export const SERIALIZER_METADATA = IdentitySerializer
export const DATA_MIME_TYPE = 'application/json'
