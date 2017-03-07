import {Injectable} from "@angular/core";
import {MessageBus} from "./messagebus/messagebus.service";

@Injectable()
export class AppStateManager {
    constructor(private eventBus: MessageBus) {
    }

    start() {
        this.eventBus.start();
    }

    stop() {
        this.eventBus.stop();
    }
}