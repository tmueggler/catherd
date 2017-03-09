import {MessageProcessor, Topic, MessageTransmitter} from "./message.receiver";
import {Message, MessageType} from "@catherd/api/node";
import {LoggerFactory} from "@catherd/logcat/node";

export class MessageDispatcher implements MessageProcessor<Message> {
    protected readonly log = LoggerFactory.get('message-dispatcher');
    private readonly handlers: Map<MessageType, MessageHandler<Message>>;

    constructor(protected readonly tx: MessageTransmitter) {
        this.handlers = new Map();
    }

    register(type: MessageType, handler: MessageHandler<Message>): void {
        this.handlers.set(type, handler);
    }

    process(topic: Topic, msg: Message): void {
        let h = this.handlers.get(msg.type);
        if (h) {
            try {
                let t = h.handle(topic, msg)
                if (t) {
                    try {
                        t(this.tx)
                    } catch (e) {
                        this.log.warn(`Uncaught message transmit exception ${e}`);
                    }
                }
            } catch (e) {
                this.log.warn(`Uncaught message handler exception ${e}`);
            }
        }
    }
}

export interface MessageHandler<M extends Message> {
    handle(topic: Topic, msg: Message): DoTransmit;
}

export interface DoTransmit {
    (tx: MessageTransmitter): void;
}