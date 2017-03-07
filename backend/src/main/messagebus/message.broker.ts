import {MessageBus} from "./messagebus.service";
import {Connection} from "sockjs";

export class MessageBroker implements MessageBus.ConnectionHandler {
    handle(con: Connection): void {
    }

}