import {BeanPostProcessor, BeanName, ContextLifecycle, Context} from "@catherd/inject/node";
import "reflect-metadata";
import {Topic, MessageReceiver, OnMessage, Subscription} from "./messagebus.service";
import {AppBeans} from "../app/app.beans";
import {Message} from "@catherd/api/node";
import {LoggerFactory} from "@catherd/logcat/node";

namespace Metadata {
    const NAMESPACE = 'messagebus';

    export const HANDLERMETHODS = `${NAMESPACE}:handlermethods`;

    export interface HandlerMethod {
        topic: Topic,
        run: string;
    }
}

// Decorator
export function MessageHandler(topic: Topic) {
    return function (target: any, property: string, descriptor: PropertyDescriptor) {
        let methods: Metadata.HandlerMethod[] = Reflect.getMetadata(Metadata.HANDLERMETHODS, target);
        if (!methods) {
            methods = [];
            Reflect.defineMetadata(Metadata.HANDLERMETHODS, methods, target);
        }
        let md: Metadata.HandlerMethod = {topic: topic, run: property};
        methods.push(md);
    }
}

const log = LoggerFactory.get('messagehandler-beanpostprocessor');

export class MessageHandlerBeanPostProcessor implements BeanPostProcessor {
    private pending: MessageHandlerProxy[] = [];
    private subscriptions: Subscription[];

    process(name: BeanName, instance: any): any {
        let methods: Metadata.HandlerMethod[] = Reflect.getMetadata(Metadata.HANDLERMETHODS, instance.constructor.prototype);
        if (!methods) return;
        if (this.destroyed) return;
        for (let metadata of methods) {
            let proxy = new MessageHandlerProxy(metadata, instance);
            if (!this.initiallized) {
                this.pending.push(proxy);
            } else {
                this.subscribe(proxy);
            }
        }
    }

    private subscribe(proxy: MessageHandlerProxy): void {
        log.debug(`Subscribe ${proxy}`);
        let topic = this.resolve(proxy.topic);
        let sub = this.receiver.subscribe(topic, proxy);
        this.subscriptions.push(sub);
    }

    private resolve(str: string): string {
        return str; // TODO
    }

    private initiallized: boolean = false;
    private receiver: MessageReceiver;

    @ContextLifecycle.Initialized()
    contextIntitialized(ctx: Context): void {
        this.receiver = ctx.get<MessageReceiver>(AppBeans.MESSAGE_BUS);
        if (this.pending) {
            for (let proxy of this.pending) {
                this.subscribe(proxy);
            }
        }
        this.initiallized = true;
    }

    private destroyed: boolean = false;

    @ContextLifecycle.Destroyed()
    contextDestroyed(ctx: Context): void {
        for (let sub of this.subscriptions) {
            sub.unsubscribe();
        }
        this.subscriptions = null;
        this.receiver = null;
        this.destroyed = true;
    }
}

class MessageHandlerProxy implements OnMessage {
    constructor(private readonly metadata: Metadata.HandlerMethod,
                private readonly instance: any) {
    }

    get topic(): Topic {
        return this.metadata.topic;
    }

    on(topic: Topic, msg: Message) {
        this.instance[this.metadata.run](topic, msg);
    }

    toString(): string {
        return `MessageHandlerProxy{${this.metadata.topic} -> ${this.metadata.run}(...)}`;
    }
}