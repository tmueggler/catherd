import {NextObserver} from "rxjs/Observer";
import {Event} from "../eventbus/eventbus.service";
import {MessageBus} from "./messagebus.service";
import {eventbus} from "../eventbus/eventbus.beanpostprocessor";

@eventbus.Observer()
export class MessageBusController implements NextObserver<Event> {
    constructor(private readonly messages: MessageBus) {
    }

    next(evt: Event) {
    }
}