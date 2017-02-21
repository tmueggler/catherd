import {MessageType, Message} from "../generic.messages";

export namespace Restart {
    const TYPE: MessageType = 11;
}

export interface Restart extends Message {
    delay_ms: number;
}

export namespace Update {
    const TYPE: MessageType = 12;
}

export interface Update extends Message {
    version: string;
}

export namespace Shutdown {
    const TYPE: MessageType = 13;
}

export interface Shutdown {
    delay_ms: number;
}