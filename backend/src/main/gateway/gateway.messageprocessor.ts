import {MessageProcessor, Topic} from "../messagebus/message.receiver";
import {LoggerFactory} from "@catherd/logcat/node";
import{Message} from "@catherd/api/node";

export class GatewayMessageProcessor implements MessageProcessor<any> {
    private readonly log = LoggerFactory.get('gateway-messageprocessor');

    process(topic: Topic, msg: Message): void {
        // TODO
    }
}