import {GatewayState} from "../gateway/gateway.model";
import {Message, MessageType} from "../generic.messages";

export namespace SignIn {
    export const TYPE: MessageType = 1;
}

export interface SignIn extends Message {
    readonly version: string;
}

export namespace SignOut {
    export const TYPE: MessageType = 2;
}

export interface SignOut extends Message {
}

export namespace StateChange {
    export const TYPE: MessageType = 3;
}

export interface StateChange extends Message {
    readonly old_state: GatewayState;
    readonly new_state: GatewayState;
}

