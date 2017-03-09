import {Message, MessageType} from "../generic.messages";

export namespace StateChange {
    export const TYPE: MessageType = 21;
}

export interface StateChange<T> extends Message {
    readonly before: T;
    readonly after: T;
}