import {MessageType, Message} from "../generic.messages";

export interface SignIn extends Message {
}

export namespace SignIn {
    export const TYPE: MessageType = 1;
}

export namespace Authorization {
    export const TYPE: MessageType = 2;

    export enum Sate{
        PENDING,
        GRANTED,
        REVOKED,
        REFUSED
    }
}

export interface Authorization extends Message {
    readonly state: Authorization.Sate;
}

export namespace Authorizations {
    export const pending = function (): Authorization {
        return {type: Authorization.TYPE, state: Authorization.Sate.PENDING};
    }
}




