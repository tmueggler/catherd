import {Injectable} from "@angular/core";
import {Configuration} from "./app.config";
import * as SockJS from "sockjs-client";
import {Observer} from "rxjs";

@Injectable()
export class EventBus {
    private readonly url: string;
    private sock: any;

    constructor(private cfg: Configuration.AppCfg) {
        this.url = cfg.socketIo.url;
    }

    start() {
        if (this.sock) {
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

    private message(msg: any) {
        console.log(`Message bus message '${msg}'`);
    }

    private disconnected() {
        console.log(`Message bus disconnected from ${this.url}`);
    }

    subscribe(observer: Observer<any>) {
    }

    send(msg: any) {
        if (!this.sock) {
            throw new Error(`No connection`);
        }
        this.sock.send(JSON.stringify(msg));
    }

    stop() {
        if (!this.sock) {
            return;
        }
        this.sock.close();
        this.sock = null;
    }
}