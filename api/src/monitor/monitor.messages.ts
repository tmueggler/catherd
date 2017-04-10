import {Message, MessageType, Timestamp} from "../generic.messages";

export interface Ping extends Message {
    timestamp: Timestamp;
}

export namespace Ping {
    export const TYPE: MessageType = 21;
}

export interface Pong extends Message {
    timestamp: Timestamp;
    pingtimestamp: Timestamp;
}

export namespace Pong {
    export const TYPE: MessageType = 22;
}