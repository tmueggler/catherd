import {OnMessage, Topic} from "../messagebus/messagebus.service";
import {Message} from "@catherd/api/node";
import {LoggerFactory} from "@catherd/logcat/node";
import {MessageHandler} from "../messagebus/messagehandler.beanpostprocessor";

const log = LoggerFactory.get('control-messageprocessor');

export class ControlMessageProcessor implements OnMessage {
    @MessageHandler('/gateway/+/control/#')
    on(topic: Topic, msg: Message): void {
        log.debug(`Control message ${msg}`);
        // TODO
    }
}