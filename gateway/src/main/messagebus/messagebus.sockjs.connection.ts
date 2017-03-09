import * as SockJS from "sockjs-client";
import * as t from "timers";
import {MessageBusConnection} from "./messagebus.service";
import {Message} from "@catherd/api/node";
import {LoggerFactory} from "@catherd/logcat/node";
import EventEmitter = NodeJS.EventEmitter;

namespace WebSocket {
    export const CONNECTING = 0;
    export const OPEN = 1;
    export const CLOSING = 2;
    export const CLOSED = 3;
}

export class SockJSConnection {
    private readonly log = LoggerFactory.get('sockjs-connection');
    reconnect_ms: number;

    constructor(private readonly url: string) {
        this.reconnect_ms = 5000;
    }

    get connected(): boolean {
        if (this.sock && this.sock.readyState === WebSocket.OPEN) {
            return true;
        }
        return false;
    }

    private sock: WebSocket;

    connect(): void {
        let sock: WebSocket = <any>SockJS(this.url); // SockJS mimics standard WebSocket api
        sock.onopen = () => this.sockOpen(sock);
        sock.onmessage = (evt: MessageEvent) => this.sockMessage(evt.data);
        sock.onerror = (evt: ErrorEvent) => this.sockError(evt);
        sock.onclose = (evt: CloseEvent) => this.sockClose(evt);
    }

    private sockOpen(sock: WebSocket): void {
        this.log.debug(`Connection to ${this.url} open`);
        this.clearReconnectTimeout();
        this.sock = sock;
        this.fireOpen();
    }

    private sockMessage(msg: string): void {
        this.log.debug(`Received message ${msg}`);
        let parsed = JSON.parse(msg);
        // TODO
    }

    private sockError(evt: ErrorEvent): void {
        this.log.warn(`WebSocket error ${evt}`);
        this.fireError(evt);
    }

    private sockClose(evt: CloseEvent): void {
        if (evt.wasClean) {
            this.sockClosedClean();
        } else {
            this.log.warn(`Connection to ${this.url} lost. Reason ${evt.code} ${evt.reason}`);
            this.sockClosedDirty();
        }
    }

    private sockClosedClean(): void {
        this.clearReconnectTimeout();
        this.sock = null;
        this.fireClose();
    }

    private sockClosedDirty(): void {
        this.clearReconnectTimeout();
        if (this.sock) {
            try {
                this.sock.close(); // close to make sure
            } catch (e) {
                // ignore
            } finally {
                this.sock = null;
            }
        }
        this.fireClose();
        this.reconnect(this.reconnect_ms);
    }

    private reconnect(delay_ms: number) {
        this.clearReconnectTimeout();
        this.log.debug(`Trying reconnect to ${this.url} in ${this.reconnect_ms}ms`);
        this.reconnectTimeout = t.setTimeout(() => this.connect(), delay_ms);
    }

    private reconnectTimeout: NodeJS.Timer;

    private clearReconnectTimeout(): void {
        if (this.reconnectTimeout) {
            t.clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }
    }

    subscribe(topic: string): void {
        // TODO
    }

    send(topic: string, msg: Message): MessageBusConnection {
        if (!this.sock) {
            return this;
        }
        // TODO topic
        let str = JSON.stringify(msg);
        this.sock.send(str);
        return this;
    }

    disconnect(): MessageBusConnection {
        if (!this.sock) {
            return this;
        }
        this.sock.close();
        this.sock = null;
        return this;
    }

    onconnected: (src: MessageBusConnection) => void;

    private fireOpen() {
        if (this.onconnected) {
            this.onconnected(this);
        }
    }

    onmessage: (src: MessageBusConnection, topic: string, msg: Message) => void;

    private fireMessage(topic: string, msg: Message): void {
        if (this.onmessage) {
            this.onmessage(this, topic, msg);
        }
    }

    ondisconnected: (src: MessageBusConnection) => void;

    private fireClose() {
        if (this.ondisconnected) {
            this.ondisconnected(this);
        }
    }

    onerror: (src: MessageBusConnection, error: any) => void;

    private fireError(error: any) {
        if (this.onerror) {
            this.onerror(this, error);
        }
    }
}
