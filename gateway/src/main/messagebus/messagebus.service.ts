import * as SockJS from "sockjs-client";
import * as t from "timers";
import {Message} from "@catherd/api/node";
import {EventBus} from "../eventbus/eventbus.service";
import {MessageBusEvent} from "./messagebus.event";

interface MessageEvent {
    data: string;
}

export class MessageBus {
    private reconnect_ms = 1000;
    private sock: any;
    private reconnectTimeout: NodeJS.Timer;

    constructor(private readonly url: string, private readonly events: EventBus) {
        this.url = `${this.url}/eventbus`
    }

    start(): void {
        if (this.sock || this.reconnectTimeout) {
            return;
        }
        this.reconnect(0);
    }

    private reconnect(delay_ms: number) {
        if (this.reconnectTimeout) {
            t.clearTimeout(this.reconnectTimeout);
        }
        this.reconnectTimeout = t.setTimeout(() => this.connect(), delay_ms);
    }

    private connect() {
        let sock = SockJS(this.url);
        sock.onopen = () => {
            if (this.reconnectTimeout) {
                t.clearTimeout(this.reconnectTimeout);
                this.reconnectTimeout = null;
            }
            this.connected(sock);
        };
        sock.onmessage = (evt: MessageEvent) => {
            this.message(evt.data);
        };
        sock.onclose = (evt: CloseEvent) => {
            if (evt.wasClean) {
                if (this.reconnectTimeout) {
                    t.clearTimeout(this.reconnectTimeout);
                    this.reconnectTimeout = null;
                }
                this.sock = null;
                this.disconnected();
                return;
            }
            console.warn(`Connection to ${this.url} lost. Reason ${evt.code} ${evt.reason}`);
            if (this.sock) {
                this.sock.close();
                // Do not set sock to null used for state tracking
            }
            console.log(`Trying reconnect to ${this.url} in ${this.reconnect_ms}ms`);
            this.reconnect(this.reconnect_ms);
        };
    }

    private connected(sock: any): void {
        console.log(`Message bus connected to ${this.url}`);
        this.sock = sock;
        this.events.send({type: MessageBusEvent.CONNECTED, src_id: null})
    }

    private message(msg: string): void {
        console.log(`Message bus message '${msg}'`);
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