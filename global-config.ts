'use strict';

import {IdentitySerializer, JsonSerializer} from 'rsocket-core';

// Defined data which will be saved into response file for player (not modify)
export const CSV_RESPONSE_HEADERS_PLAYER = ['id', 'response_time_in_millis',
    'specific_second_of_communication', 'version_response', 'size', 'request_timestamp'];

// Defined data which will be saved into response file for monster (not modify)
export const CSV_RESPONSE_HEADERS_MONSTER = ['id', 'specific_second_of_communication', 'request_timestamp', 'response_time_in_millis'];

// 1) Serializer for RSocket
export const SERIALIZER_DATA = JsonSerializer
export const SERIALIZER_METADATA = IdentitySerializer
export const DATA_MIME_TYPE = 'application/json'
