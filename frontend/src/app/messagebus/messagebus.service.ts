import {Injectable} from "@angular/core";
import {Configuration} from "../app.config";
import {Message} from "@catherd/api/web";
import * as SockJS from "sockjs-client";
import Stomp = require("stompjs");

@Injectable()
export class EventBus {
    private readonly url: string;
    private connection: MessageBus.Connection;

    constructor(private cfg: Configuration.AppCfg) {
        this.url = cfg.messagebus.url;
    }

    start() {
        if (this.connection) {
            return;
        }
        //this.connection = new MessageBus.RawConnection();
        this.connection = new MessageBus.StompConnection();
        this.connection.connect(`${this.url}/stomp`);
    }

    send(destination: string, msg: Message) {
        if (!this.connection) {
            throw new Error(`No connection`);
        }
        this.connection.send(destination, msg);
    }

    stop() {
        if (!this.connection) {
            return;
        }
        this.connection.close();
    }
}

export type Topic = string;

namespace MessageBus {
    export interface Connection {
        connect(url: string): void;
        send(topic: string, message: Message): void;
        subscribe(topic: Topic, callback: (msg: Message) => void): void;
        close(): void;
    }

    export class RawConnection implements Connection {
        private sock: WebSocket;

        connect(url: string): void {
            this.sock = <any>new SockJS(url);
            this.sock.onopen = (evt) => {
                console.log(`Open: ${evt}`);
            };
            this.sock.onmessage = (evt) => {
                console.log(`Message: ${evt}`);
            };
            this.sock.onerror = (evt) => {
                console.log(`Error: ${evt}`);
            };
            this.sock.onclose = (evt) => {
                console.log(`Close: ${evt}`);
            };
        }

        send(topic: string, message: Message): void {
            if (!this.sock) {
                throw new Error('Not connected');
            }
            // TODO topic
            this.sock.send(JSON.stringify(message));
        }

        subscribe(topic: Topic, callback: (msg: Message) => void) {
        }

        close(): void {
            if (this.sock) {
                this.sock.close();
            }
        }
    }

    export class StompConnection implements Connection {
        private client: Stomp.Client;

        connect(url: string): void {
            let sock: WebSocket = <any>SockJS(url);
            this.client = Stomp.over(sock);
            this.client.connect('', '',
                (frame) => {
                    console.log(``);
                },
                (error) => {
                    console.log(``);
                })
        }

        send(topic: string, message: Message): void {
            if (!this.client) {
                throw new Error('Not connected');
            }
            this.client.send(topic, {}, JSON.stringify(message));
        }

        subscribe(topic: Topic, callback: (msg: Message) => void) {
            if (!this.client) {
                throw new Error('Not connected');
            }
            this.client.subscribe(topic, (msg) => callback(JSON.parse(msg.body)));
        }

        close(): void {
            if (this.client) {
                this.client.disconnect(() => {
                });
            }
        }
    }
}
