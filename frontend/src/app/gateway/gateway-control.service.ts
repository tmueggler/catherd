import {Injectable} from "@angular/core";
import {MessageBus} from "../messagebus/messagebus.service";
import {Gateway} from "./gateway.model";
import {Restart, Update, Shutdown} from "@catherd/api/web";

@Injectable()
export class GatewayControlService {
    constructor(private readonly eventbus: MessageBus) {
    }

    restart(trg: Gateway) {
        let msg: Restart = {
            type: Restart.TYPE,
            delay_ms: 0
        };
        this.eventbus.send(`/gateway/${trg.uuid}/control`, msg);
    }

    update(trg: Gateway) {
        let msg: Update = {
            type: Update.TYPE,
            version: null
        };
        this.eventbus.send(`/gateway/${trg.uuid}/control`, msg);
    }

    shutdown(trg: Gateway) {
        let msg: Shutdown = {
            type: Shutdown.TYPE,
            delay_ms: 0
        };
        this.eventbus.send(`/gateway/${trg.uuid}/control`, msg);
    }
}