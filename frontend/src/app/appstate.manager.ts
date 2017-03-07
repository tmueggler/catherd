import {Injectable} from "@angular/core";
import {EventBus} from "./messagebus/messagebus.service";

@Injectable()
export class AppStateManager {
    constructor(private eventBus: EventBus) {
    }

    start() {
        this.eventBus.start();
    }

    stop() {
        this.eventBus.stop();
    }
}