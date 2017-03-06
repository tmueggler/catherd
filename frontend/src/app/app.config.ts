import {Injectable} from "@angular/core";

export namespace Configuration {
    @Injectable()
    export class AppCfg {
        readonly global: GlobalCfg;
        readonly socketIo: SocketIOCfg;

        constructor() {
            this.global = {
                protocol: 'http',
                host: 'localhost',
                port: 3000
            };
            this.socketIo = {
                url: `${this.global.protocol}://${this.global.host}:${this.global.port}/messagebus`
            }
        }
    }

    export interface GlobalCfg {
        readonly protocol: string;
        readonly host: string;
        readonly port: number;
    }

    export interface SocketIOCfg {
        readonly url: string;
    }
}