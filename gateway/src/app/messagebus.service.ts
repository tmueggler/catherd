import * as SockJS from "sockjs-client";
import {Message} from "@catherd/api/node";

export class MessageBus {
    private sock: any;

    constructor(private readonly url: string) {
        this.url = `${this.url}/eventbus`
    }

    start() {
        if (this.sock != null) {
            return;
        }
        this.sock = SockJS(this.url);
        this.sock.onopen = this.connected.bind(this);
        this.sock.onmessage = this.message.bind(this);
        this.sock.onclose = this.disconnected.bind(this);
    }

    private connected() {
        console.log(`Message bus connected to ${this.url}`);
    }

    private message(msg: sockjs.MessageEvent) {
        console.log(`Message bus message '${msg.data}'`);
    }

    private disconnected() {
        console.log(`Message bus disconnected from ${this.url}`);
    }

    send(msg: Message) {
        this.sock.send(JSON.stringify(msg));
    }

    stop() {
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