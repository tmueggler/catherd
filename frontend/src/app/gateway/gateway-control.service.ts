import {Injectable} from "@angular/core";
import {EventBus} from "../eventbus.service";
import {Gateway} from "./gateway.model";
import {Restart, Update, Shutdown} from "@catherd/api";

@Injectable()
export class GatewayControlService {
    constructor(private readonly eventbus: EventBus) {
    }

    restart(trg: Gateway) {
        let msg: Restart = {
            type: Restart.TYPE,
            from: null,
            to: trg.uuid,
            delay_ms: 0
        };
        this.eventbus.send(msg);
    }

    update(trg: Gateway) {
        let msg: Update = {
            type: Update.TYPE,
            from: null,
            to: trg.uuid,
            version: null
        };
        this.eventbus.send(msg);
    }

    shutdown(trg: Gateway) {
        this.eventbus.send({
            type: Shutdown.TYPE,
            from: null,
            to: trg.uuid,
            delay_ms: 0
        });
    }
}