import {Injectable} from "@angular/core";

export namespace Configuration {
    @Injectable()
    export class AppCfg {
        readonly global: GlobalCfg;
        readonly messagebus: MessageBusCfg;

        constructor() {
            this.global = {
                protocol: 'http',
                host: 'localhost',
                port: 3000
            };
            this.messagebus = {
                url: `${this.global.protocol}://${this.global.host}:${this.global.port}/messagebus`
            }
        }
    }

    export interface GlobalCfg {
        readonly protocol: string;
        readonly host: string;
        readonly port: number;
    }

    export interface MessageBusCfg {
        readonly url: string;
    }
}