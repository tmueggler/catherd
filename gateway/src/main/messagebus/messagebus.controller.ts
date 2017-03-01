import {NextObserver} from "rxjs/Observer";
import {Event} from "../eventbus/eventbus.service";
import {MessageBus} from "./messagebus.service";
import {EventBusObserver} from "../eventbus/eventbus.beanpostprocessor";
import {AppEvent} from "../app/app.event";

@EventBusObserver()
export class MessageBusController implements NextObserver<Event> {
    constructor(private readonly messages: MessageBus) {
    }

    next(evt: Event) {
        switch (evt.type) {
            case AppEvent.START:
                this.messages.start();
                break;
            case AppEvent.STOP:
                this.messages.stop();
                break;
            default:
                break;
        }
    }
}