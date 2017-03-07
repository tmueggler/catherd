import {Injectable} from "@angular/core";
import {Configuration} from "../app.config";
import {Message} from "@catherd/api/web";
import {SockJSConnection} from "./messagebus.sockjs";
import {StompConnection} from "./messagebus.stomp";

namespace ConnectionType {
    export const SOCKJS: number = 1;
    export const STOMP: number = 2;
}

@Injectable()
export class MessageBus {
    private readonly url: string;
    private connection: Connection;

    constructor(private cfg: Configuration.AppCfg) {
        this.url = cfg.messagebus.url;
    }

    start() {
        if (this.connection) {
            return;
        }
        switch (ConnectionType.STOMP) {
            case ConnectionType.SOCKJS:
                this.connection = new SockJSConnection();
                break;
            case ConnectionType.STOMP:
                this.connection = new StompConnection();
                break;
            default:
                break;
        }
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

export interface Connection {
    connect(url: string): void;
    send(topic: string, message: Message): void;
    subscribe(topic: Topic, callback: (msg: Message) => void): void;
    close(): void;
}