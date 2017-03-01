import {NextObserver} from "rxjs/Observer";
import {RegistrationService} from "../registration.service";
import {Event} from "../eventbus/eventbus.service";
import {eventbus} from "../eventbus/eventbus.beanpostprocessor";

@eventbus.Observer()
export class RegistrationController implements NextObserver<Event> {
    constructor(private readonly registrations: RegistrationService) {
    }

    next(evt: Event) {
    }
}