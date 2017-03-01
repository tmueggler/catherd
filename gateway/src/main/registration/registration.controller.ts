import {NextObserver} from "rxjs/Observer";
import {RegistrationService} from "./registration.service";
import {Event} from "../eventbus/eventbus.service";
import {EventBusObserver} from "../eventbus/eventbus.beanpostprocessor";
import {MessageBusEvent} from "../messagebus/messagebus.event";

@EventBusObserver()
export class RegistrationController implements NextObserver<Event> {
    constructor(private readonly registrations: RegistrationService) {
    }

    next(evt: Event) {
        switch (evt.type) {
            case MessageBusEvent.CONNECTED:
                this.registrations.register();
                break;
            case MessageBusEvent.DISCONNECTED:
                this.registrations.deregister();
                break;
            default:
                break;
        }
    }
}