import * as SockJS from "sockjs-client";
import {Message} from "@catherd/api/node";
import {EventBus} from "../eventbus/eventbus.service";
import {MessageBusEvent} from "./messagebus.event";

export class MessageBus {
    private sock: any;

    constructor(private readonly url: string, private readonly events: EventBus) {
        this.url = `${this.url}/eventbus`
    }

    start(): void {
        if (this.sock != null) {
            return;
        }
        this.sock = SockJS(this.url);
        this.sock.onopen = this.connected.bind(this);
        this.sock.onmessage = this.message.bind(this);
        this.sock.onclose = this.disconnected.bind(this);
    }

    private connected(): void {
        console.log(`Message bus connected to ${this.url}`);
        this.events.send({type: MessageBusEvent.CONNECTED, src_id: null})
    }

    private message(msg: sockjs.MessageEvent): void {
        console.log(`Message bus message '${msg.data}'`);
    }

    private disconnected(): void {
        console.log(`Message bus disconnected from ${this.url}`);
        this.events.send({type: MessageBusEvent.DISCONNECTED, src_id: null});
    }

    send(msg: Message): void {
        this.sock.send(JSON.stringify(msg));
    }

    stop(): void {
        if (this.sock == null) {
            return;
        }
        this.sock.close();
        this.sock = null;
    }
}

declare namespace sockjs {
    interface MessageEvent {
        type: string;
        data: string;
    }
}