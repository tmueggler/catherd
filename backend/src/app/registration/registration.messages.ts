import {GatewayState} from "../gateway/gateway.model";
import {Message} from "../generic.messages";

export namespace SignIn {
    export const TYPE = 1;
}

export interface SignIn extends Message {
    readonly version: string;
}

export namespace SignOut {
    export const TYPE = 2;
}

export interface SignOut extends Message {
}

export namespace StateChange {
    export const TYPE = 3;
}

export interface StateChange extends Message {
    readonly old_state: GatewayState;
    readonly new_state: GatewayState;
}

