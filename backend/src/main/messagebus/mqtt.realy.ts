import {MessageBus} from "./messagebus.service";
import {Connection} from "sockjs-node";

export class MqttRelay implements MessageBus.ConnectionHandler {
    handle(con: Connection): void {
    }
}