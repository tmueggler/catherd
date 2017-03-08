import {MessageBus} from "./messagebus.service";
import {Connection} from "sockjs-node";
import {MessagingCfg} from "./messagebus.config";

export class MqttRelay implements MessageBus.ConnectionHandler {
    constructor(private readonly cfg: MessagingCfg.ServerCfg.MqttCfg) {
    }

    handle(con: Connection): void {
    }
}