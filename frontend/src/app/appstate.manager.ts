import {Injectable} from "@angular/core";
import {EventBus} from "./eventbus.service";

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