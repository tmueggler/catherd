import * as SockJS from "sockjs-client";
import * as t from "timers";
import {Message} from "@catherd/api/node";
import {EventBus} from "../eventbus/eventbus.service";
import {MessageBusEvent} from "./messagebus.event";
import {PartialObserver} from "rxjs/Observer";
import {Subscription, Subject, ConnectableObservable} from "rxjs";

export class MessageBus {
    private readonly subject: Subject<Message>;
    private readonly publisher: ConnectableObservable<Message>;
    private readonly connection: MessageBusConnection;
    private reconnect_ms = 5000;

    constructor(private readonly url: string, private readonly events: EventBus) {
        this.subject = new Subject();
        this.publisher = this.subject.publish();
        this.connection = new MessageBusConnection(
            `${this.url}/messagebus`,
            {
                open: (con: MessageBusConnection) => events.send({type: MessageBusEvent.CONNECTED, src_id: null}),
                message: (con: MessageBusConnection, msg: Message) => this.subject.next(msg),
                closed: (con: MessageBusConnection) => events.send({type: MessageBusEvent.DISCONNECTED, src_id: null})
            }
        );
        this.connection.reconnect_ms = this.reconnect_ms;
    }

    private publisherSubscription: Subscription;

    start(): void {
        if (!this.publisherSubscription) {
            this.publisherSubscription = this.publisher.connect();
        }
        if (!this.connection.connected) {
            this.connection.connect();
        }
    }

    subscribe(observer: PartialObserver<Message>): Subscription {
        return this.publisher.subscribe(observer);
    }

    send(msg: Message): void {
        if (!this.connection.connected) {
            throw new Error(`Not connected`);
        }
        this.connection.send(msg);
    }

    stop(): void {
        this.connection.disconnect();
        if (this.publisherSubscription) {
            this.publisherSubscription.unsubscribe();
            this.publisherSubscription = null;
        }
    }
}

namespace WebSocket {
    export const CONNECTING = 0;
    export const OPEN = 1;
    export const CLOSING = 2;
    export const CLOSED = 3;
}

class MessageBusConnection {
    reconnect_ms: number;

    constructor(private readonly url: string, private readonly handler: MessageBusConnectionHandler) {
        this.reconnect_ms = 5000;
    }

    get connected(): boolean {
        if (this.sock && this.sock.readyState === WebSocket.OPEN) {
            return true;
        }
        return false;
    }

    private sock: WebSocket;

    connect(): MessageBusConnection {
        let sock: WebSocket = <any>SockJS(this.url); // SockJS mimics standard WebSocket api
        sock.onopen = this.sockOpen.bind(this, sock);
        sock.onmessage = (evt: MessageEvent) => this.sockMessage(evt.data);
        sock.onerror = (evt: ErrorEvent) => this.sockError(evt);
        sock.onclose = this.sockClose.bind(this);
        return this;
    }

    private sockOpen(sock: WebSocket): void {
        console.log(`Connection to ${this.url} open`);
        this.clearReconnectTimeout();
        this.sock = sock;
        this.handler.open(this);
    }

    private sockMessage(msg: string): void {
        console.log(`Received message ${msg}`);
        this.handler.message(this, JSON.parse(msg));
    }

    private sockError(evt: ErrorEvent): void {
        console.warn(`WebSocket error ${evt}`);
        // TODO
    }

    private sockClose(evt: CloseEvent): void {
        if (evt.wasClean) {
            this.sockClosedClean();
        } else {
            console.warn(`Connection to ${this.url} lost. Reason ${evt.code} ${evt.reason}`);
            this.sockClosedDirty();
        }
    }

    private sockClosedClean(): void {
        this.clearReconnectTimeout();
        this.sock = null;
        this.handler.closed(this);
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
        this.handler.closed(this);
        this.reconnect(this.reconnect_ms);
    }

    private reconnect(delay_ms: number) {
        this.clearReconnectTimeout();
        console.log(`Trying reconnect to ${this.url} in ${this.reconnect_ms}ms`);
        this.reconnectTimeout = t.setTimeout(() => this.connect(), delay_ms);
    }

    private reconnectTimeout: NodeJS.Timer;

    private clearReconnectTimeout(): void {
        if (this.reconnectTimeout) {
            t.clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }
    }

    send(msg: Message): MessageBusConnection {
        if (!this.sock) {
            return this;
        }
        this.sock.send(JSON.stringify(msg));
        return this;
    }

    disconnect(): MessageBusConnection {
        if (!this.sock) {
            return this;
        }
        this.sock.close();
        this.sock = null;
        this.handler.closed(this);
        return this;
    }
}

interface MessageBusConnectionHandler {
    open(con: MessageBusConnection): void;
    message(con: MessageBusConnection, msg: Message): void;
    closed(con: MessageBusConnection): void;
}