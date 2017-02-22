import {MessageType, Message} from "../generic.messages";

export namespace Restart {
    export const TYPE: MessageType = 11;
}

export interface Restart extends Message {
    delay_ms: number;
}

export namespace Update {
    export const TYPE: MessageType = 12;
}

export interface Update extends Message {
    version: string;
}

export namespace Shutdown {
    export const TYPE: MessageType = 13;
}

export interface Shutdown {
    delay_ms: number;
}