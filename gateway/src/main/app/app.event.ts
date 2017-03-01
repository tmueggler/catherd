import {EventType} from "../eventbus/eventbus.service";

export namespace AppEvent {
    export const START: EventType = 1;
    export const STOP: EventType = 2;
}