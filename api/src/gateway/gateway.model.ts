export namespace Gateway {
    export enum State{
        OFFLINE, ONLINE, RESTARTING, UPDATEING
    }

    export interface Info {
        uuid: string,
        version: string,
        state: Gateway.State
    }

    export interface Configuration {
    }
}