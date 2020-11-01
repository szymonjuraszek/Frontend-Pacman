'use strict';

import {IdentitySerializer, JsonSerializer} from 'rsocket-core';
import {ProtobufFormatter} from "./src/app/communication/format/ProtobufFormatter";
import {JsonFormatter} from "./src/app/communication/format/JsonFormatter";
import {CustomBinaryFormatter} from "./src/app/communication/format/CustomBinaryFormatter";

// Defined data which will be saved into response file for player (not modify)
export const CSV_RESPONSE_HEADERS_PLAYER = ['id', 'response_time_in_millis',
    'specific_second_of_communication', 'version_response', 'size', 'request_timestamp'];

// Defined data which will be saved into response file for monster (not modify)
export const CSV_RESPONSE_HEADERS_MONSTER = ['id', 'specific_second_of_communication', 'request_timestamp', 'response_time_in_millis'];

//-----------------------   Global options for application which you can modify    -------------------------
// 1) URLS
// domain for server (http2)
// export const HTTP_URL_MAIN = 'https://localhost:8080';
export const HTTP_URL_MAIN = 'https://83.229.84.77:8080';
// websocket(stomp) URL for connection
// export const WEBSOCKET_URL_MAIN = 'ws://localhost:8080/socket';
export const WEBSOCKET_URL_MAIN = 'ws://83.229.84.77:8080/socket';
// rsocket(websocket) URL for connection
// export const RSOCKET_URL_MAIN =  'ws://localhost:8080/rsocket';
export const RSOCKET_URL_MAIN = 'ws://83.229.84.77:8080/rsocket';

// 3) Serializer for RSocket
export const SERIALIZER_DATA = JsonSerializer
export const SERIALIZER_METADATA = IdentitySerializer
export const DATA_MIME_TYPE = 'application/json'

// 4) Formatter for Websocket
// export const FORMATTER_WEBSOCKET = new ProtobufFormatter();
export const FORMATTER_WEBSOCKET = new JsonFormatter();
// export const FORMATTER_WEBSOCKET = new CustomBinaryFormatter();

// 5) Game properties:
// export const SENDING_MESSAGE_FREQUENCY = 10;
// export const SENDING_MESSAGE_FREQUENCY = 15;
export const SENDING_MESSAGE_FREQUENCY = 21;
export const SIZE_OF_ADDITIONAL_DATA = 50;
// export const SIZE_OF_ADDITIONAL_DATA = 100;
