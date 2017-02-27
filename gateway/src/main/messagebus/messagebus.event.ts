import {EventType} from "../eventbus/eventbus.service";

export namespace MessageBusEvent {
    export const CONNECTED: EventType = 11;
    export const DISCONNECTED: EventType = 12;
}