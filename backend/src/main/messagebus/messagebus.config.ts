export namespace MessagingCfg {
    export namespace ServerCfg {
        export interface BrokerCfg {
            path: string
        }

        export interface StompCfg {
            path: string,
            broker_url: string
        }

        export interface MqttCfg {
            path: string,
            broker_url: string
        }
    }

    export interface ServerCfg {
        broker: MessagingCfg.ServerCfg.BrokerCfg;
        stomp: MessagingCfg.ServerCfg.StompCfg;
        mqtt: MessagingCfg.ServerCfg.MqttCfg;
    }

    export const SERVER: ServerCfg = {
        broker: {path: '/messagebus'},
        stomp: {path: '/messagebus/stomp', broker_url: 'mqtt://192.168.56.104:1883'},
        mqtt: {path: '/messagebus/mqtt', broker_url: 'mqtt://192.168.56.104:1883'}
    };

    export interface ReceiverCfg {
        broker_url: string;
    }

    export const RECEIVER: ReceiverCfg = {
        broker_url: 'mqtt://192.168.56.104:1883'
    };
}
