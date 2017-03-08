import {MessageBus} from "./messagebus.service";
import {Connection} from "sockjs";
import {MessagingCfg} from "./messagebus.config";

export class MessageBroker implements MessageBus.ConnectionHandler {
    constructor(private readonly cfg: MessagingCfg.ServerCfg.BrokerCfg) {
    }

    handle(con: Connection): void {
    }
}