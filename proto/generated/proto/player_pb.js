// source: proto/player.proto
/**
 * @fileoverview
 * @enhanceable
 * @suppress {messageConventions} JS Compiler reports an error if a variable or
 *     field starts with 'MSG_' and isn't a translatable message.
 * @public
 */
// GENERATED CODE -- DO NOT EDIT!

var jspb = require('google-protobuf');
var goog = jspb;
var global = Function('return this')();

goog.exportSymbol('proto.PlayerProto', null, global);
goog.exportSymbol('proto.PlayerProto.AdditionalData', null, global);
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.PlayerProto = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, proto.PlayerProto.repeatedFields_, null);
};
goog.inherits(proto.PlayerProto, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.PlayerProto.displayName = 'proto.PlayerProto';
}
/**
 * Generated by JsPbCodeGenerator.
 * @param {Array=} opt_data Optional initial data array, typically from a
 * server response, or constructed directly in Javascript. The array is used
 * in place and becomes part of the constructed object. It is not cloned.
 * If no data is provided, the constructed object will be empty, but still
 * valid.
 * @extends {jspb.Message}
 * @constructor
 */
proto.PlayerProto.AdditionalData = function(opt_data) {
  jspb.Message.initialize(this, opt_data, 0, -1, null, null);
};
goog.inherits(proto.PlayerProto.AdditionalData, jspb.Message);
if (goog.DEBUG && !COMPILED) {
  /**
   * @public
   * @override
   */
  proto.PlayerProto.AdditionalData.displayName = 'proto.PlayerProto.AdditionalData';
}

/**
 * List of repeated fields within this message type.
 * @private {!Array<number>}
 * @const
 */
proto.PlayerProto.repeatedFields_ = [7];



if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.PlayerProto.prototype.toObject = function(opt_includeInstance) {
  return proto.PlayerProto.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.PlayerProto} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.PlayerProto.toObject = function(includeInstance, msg) {
  var f, obj = {
    nickname: jspb.Message.getFieldWithDefault(msg, 1, ""),
    positionX: jspb.Message.getFieldWithDefault(msg, 2, 0),
    positionY: jspb.Message.getFieldWithDefault(msg, 3, 0),
    score: jspb.Message.getFieldWithDefault(msg, 4, 0),
    stepDirection: jspb.Message.getFieldWithDefault(msg, 5, ""),
    version: jspb.Message.getFieldWithDefault(msg, 6, 0),
    additionaldataList: jspb.Message.toObjectList(msg.getAdditionaldataList(),
    proto.PlayerProto.AdditionalData.toObject, includeInstance)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.PlayerProto}
 */
proto.PlayerProto.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.PlayerProto;
  return proto.PlayerProto.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.PlayerProto} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.PlayerProto}
 */
proto.PlayerProto.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setNickname(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setPositionX(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setPositionY(value);
      break;
    case 4:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setScore(value);
      break;
    case 5:
      var value = /** @type {string} */ (reader.readString());
      msg.setStepDirection(value);
      break;
    case 6:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setVersion(value);
      break;
    case 7:
      var value = new proto.PlayerProto.AdditionalData;
      reader.readMessage(value,proto.PlayerProto.AdditionalData.deserializeBinaryFromReader);
      msg.addAdditionaldata(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.PlayerProto.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.PlayerProto.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.PlayerProto} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.PlayerProto.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getNickname();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getPositionX();
  if (f !== 0) {
    writer.writeInt32(
      2,
      f
    );
  }
  f = message.getPositionY();
  if (f !== 0) {
    writer.writeInt32(
      3,
      f
    );
  }
  f = message.getScore();
  if (f !== 0) {
    writer.writeInt32(
      4,
      f
    );
  }
  f = message.getStepDirection();
  if (f.length > 0) {
    writer.writeString(
      5,
      f
    );
  }
  f = message.getVersion();
  if (f !== 0) {
    writer.writeInt32(
      6,
      f
    );
  }
  f = message.getAdditionaldataList();
  if (f.length > 0) {
    writer.writeRepeatedMessage(
      7,
      f,
      proto.PlayerProto.AdditionalData.serializeBinaryToWriter
    );
  }
};





if (jspb.Message.GENERATE_TO_OBJECT) {
/**
 * Creates an object representation of this proto.
 * Field names that are reserved in JavaScript and will be renamed to pb_name.
 * Optional fields that are not set will be set to undefined.
 * To access a reserved field use, foo.pb_<name>, eg, foo.pb_default.
 * For the list of reserved names please see:
 *     net/proto2/compiler/js/internal/generator.cc#kKeyword.
 * @param {boolean=} opt_includeInstance Deprecated. whether to include the
 *     JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @return {!Object}
 */
proto.PlayerProto.AdditionalData.prototype.toObject = function(opt_includeInstance) {
  return proto.PlayerProto.AdditionalData.toObject(opt_includeInstance, this);
};


/**
 * Static version of the {@see toObject} method.
 * @param {boolean|undefined} includeInstance Deprecated. Whether to include
 *     the JSPB instance for transitional soy proto support:
 *     http://goto/soy-param-migration
 * @param {!proto.PlayerProto.AdditionalData} msg The msg instance to transform.
 * @return {!Object}
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.PlayerProto.AdditionalData.toObject = function(includeInstance, msg) {
  var f, obj = {
    text: jspb.Message.getFieldWithDefault(msg, 1, ""),
    number1: jspb.Message.getFieldWithDefault(msg, 2, 0),
    number2: jspb.Message.getFieldWithDefault(msg, 3, 0),
    number3: jspb.Message.getFieldWithDefault(msg, 4, 0)
  };

  if (includeInstance) {
    obj.$jspbMessageInstance = msg;
  }
  return obj;
};
}


/**
 * Deserializes binary data (in protobuf wire format).
 * @param {jspb.ByteSource} bytes The bytes to deserialize.
 * @return {!proto.PlayerProto.AdditionalData}
 */
proto.PlayerProto.AdditionalData.deserializeBinary = function(bytes) {
  var reader = new jspb.BinaryReader(bytes);
  var msg = new proto.PlayerProto.AdditionalData;
  return proto.PlayerProto.AdditionalData.deserializeBinaryFromReader(msg, reader);
};


/**
 * Deserializes binary data (in protobuf wire format) from the
 * given reader into the given message object.
 * @param {!proto.PlayerProto.AdditionalData} msg The message object to deserialize into.
 * @param {!jspb.BinaryReader} reader The BinaryReader to use.
 * @return {!proto.PlayerProto.AdditionalData}
 */
proto.PlayerProto.AdditionalData.deserializeBinaryFromReader = function(msg, reader) {
  while (reader.nextField()) {
    if (reader.isEndGroup()) {
      break;
    }
    var field = reader.getFieldNumber();
    switch (field) {
    case 1:
      var value = /** @type {string} */ (reader.readString());
      msg.setText(value);
      break;
    case 2:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setNumber1(value);
      break;
    case 3:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setNumber2(value);
      break;
    case 4:
      var value = /** @type {number} */ (reader.readInt32());
      msg.setNumber3(value);
      break;
    default:
      reader.skipField();
      break;
    }
  }
  return msg;
};


/**
 * Serializes the message to binary data (in protobuf wire format).
 * @return {!Uint8Array}
 */
proto.PlayerProto.AdditionalData.prototype.serializeBinary = function() {
  var writer = new jspb.BinaryWriter();
  proto.PlayerProto.AdditionalData.serializeBinaryToWriter(this, writer);
  return writer.getResultBuffer();
};


/**
 * Serializes the given message to binary data (in protobuf wire
 * format), writing to the given BinaryWriter.
 * @param {!proto.PlayerProto.AdditionalData} message
 * @param {!jspb.BinaryWriter} writer
 * @suppress {unusedLocalVariables} f is only used for nested messages
 */
proto.PlayerProto.AdditionalData.serializeBinaryToWriter = function(message, writer) {
  var f = undefined;
  f = message.getText();
  if (f.length > 0) {
    writer.writeString(
      1,
      f
    );
  }
  f = message.getNumber1();
  if (f !== 0) {
    writer.writeInt32(
      2,
      f
    );
  }
  f = message.getNumber2();
  if (f !== 0) {
    writer.writeInt32(
      3,
      f
    );
  }
  f = message.getNumber3();
  if (f !== 0) {
    writer.writeInt32(
      4,
      f
    );
  }
};


/**
 * optional string text = 1;
 * @return {string}
 */
proto.PlayerProto.AdditionalData.prototype.getText = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.PlayerProto.AdditionalData} returns this
 */
proto.PlayerProto.AdditionalData.prototype.setText = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional int32 number1 = 2;
 * @return {number}
 */
proto.PlayerProto.AdditionalData.prototype.getNumber1 = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/**
 * @param {number} value
 * @return {!proto.PlayerProto.AdditionalData} returns this
 */
proto.PlayerProto.AdditionalData.prototype.setNumber1 = function(value) {
  return jspb.Message.setProto3IntField(this, 2, value);
};


/**
 * optional int32 number2 = 3;
 * @return {number}
 */
proto.PlayerProto.AdditionalData.prototype.getNumber2 = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 3, 0));
};


/**
 * @param {number} value
 * @return {!proto.PlayerProto.AdditionalData} returns this
 */
proto.PlayerProto.AdditionalData.prototype.setNumber2 = function(value) {
  return jspb.Message.setProto3IntField(this, 3, value);
};


/**
 * optional int32 number3 = 4;
 * @return {number}
 */
proto.PlayerProto.AdditionalData.prototype.getNumber3 = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 4, 0));
};


/**
 * @param {number} value
 * @return {!proto.PlayerProto.AdditionalData} returns this
 */
proto.PlayerProto.AdditionalData.prototype.setNumber3 = function(value) {
  return jspb.Message.setProto3IntField(this, 4, value);
};


/**
 * optional string nickname = 1;
 * @return {string}
 */
proto.PlayerProto.prototype.getNickname = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 1, ""));
};


/**
 * @param {string} value
 * @return {!proto.PlayerProto} returns this
 */
proto.PlayerProto.prototype.setNickname = function(value) {
  return jspb.Message.setProto3StringField(this, 1, value);
};


/**
 * optional int32 position_x = 2;
 * @return {number}
 */
proto.PlayerProto.prototype.getPositionX = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 2, 0));
};


/**
 * @param {number} value
 * @return {!proto.PlayerProto} returns this
 */
proto.PlayerProto.prototype.setPositionX = function(value) {
  return jspb.Message.setProto3IntField(this, 2, value);
};


/**
 * optional int32 position_y = 3;
 * @return {number}
 */
proto.PlayerProto.prototype.getPositionY = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 3, 0));
};


/**
 * @param {number} value
 * @return {!proto.PlayerProto} returns this
 */
proto.PlayerProto.prototype.setPositionY = function(value) {
  return jspb.Message.setProto3IntField(this, 3, value);
};


/**
 * optional int32 score = 4;
 * @return {number}
 */
proto.PlayerProto.prototype.getScore = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 4, 0));
};


/**
 * @param {number} value
 * @return {!proto.PlayerProto} returns this
 */
proto.PlayerProto.prototype.setScore = function(value) {
  return jspb.Message.setProto3IntField(this, 4, value);
};


/**
 * optional string step_direction = 5;
 * @return {string}
 */
proto.PlayerProto.prototype.getStepDirection = function() {
  return /** @type {string} */ (jspb.Message.getFieldWithDefault(this, 5, ""));
};


/**
 * @param {string} value
 * @return {!proto.PlayerProto} returns this
 */
proto.PlayerProto.prototype.setStepDirection = function(value) {
  return jspb.Message.setProto3StringField(this, 5, value);
};


/**
 * optional int32 version = 6;
 * @return {number}
 */
proto.PlayerProto.prototype.getVersion = function() {
  return /** @type {number} */ (jspb.Message.getFieldWithDefault(this, 6, 0));
};


/**
 * @param {number} value
 * @return {!proto.PlayerProto} returns this
 */
proto.PlayerProto.prototype.setVersion = function(value) {
  return jspb.Message.setProto3IntField(this, 6, value);
};


/**
 * repeated AdditionalData additionalData = 7;
 * @return {!Array<!proto.PlayerProto.AdditionalData>}
 */
proto.PlayerProto.prototype.getAdditionaldataList = function() {
  return /** @type{!Array<!proto.PlayerProto.AdditionalData>} */ (
    jspb.Message.getRepeatedWrapperField(this, proto.PlayerProto.AdditionalData, 7));
};


/**
 * @param {!Array<!proto.PlayerProto.AdditionalData>} value
 * @return {!proto.PlayerProto} returns this
*/
proto.PlayerProto.prototype.setAdditionaldataList = function(value) {
  return jspb.Message.setRepeatedWrapperField(this, 7, value);
};


/**
 * @param {!proto.PlayerProto.AdditionalData=} opt_value
 * @param {number=} opt_index
 * @return {!proto.PlayerProto.AdditionalData}
 */
proto.PlayerProto.prototype.addAdditionaldata = function(opt_value, opt_index) {
  return jspb.Message.addToRepeatedWrapperField(this, 7, opt_value, proto.PlayerProto.AdditionalData, opt_index);
};


/**
 * Clears the list making it empty but non-null.
 * @return {!proto.PlayerProto} returns this
 */
proto.PlayerProto.prototype.clearAdditionaldataList = function() {
  return this.setAdditionaldataList([]);
};


goog.object.extend(exports, proto);
