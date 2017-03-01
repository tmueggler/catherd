import {BeanPostProcessor, BeanName, Context} from "@catherd/inject/node";
import {PartialObserver} from "rxjs/Observer";
import {EventBus, Event} from "./eventbus.service";
import "reflect-metadata";
import {AppBeans} from "../app.beans";

namespace EventBusMetadata {
    const NAMESPACE = 'eventbus';
    export const OBSERVER = `${NAMESPACE}:observer`;
}

// Class Decorator
export function EventBusObserver() {
    return (constructor: Function) => {
        Reflect.defineMetadata(EventBusMetadata.OBSERVER, true, constructor);
    }
}

export class EventBusBeanPostProcessor implements BeanPostProcessor {
    private pending: PartialObserver<Event>[] = [];

    process(name: BeanName, instance: any): void {
        if (Reflect.hasMetadata(EventBusMetadata.OBSERVER, instance.constructor)) {
            if (this.eventbus) { // context has been initialized
                let sub = this.eventbus.subscribe(instance);
                // TODO what with subscription
            } else { // pending until context is initialized
                this.pending.push(instance);
            }
        }
    }

    private eventbus: EventBus;

    @Context.Initialized()
    contextInitialized(ctx: Context) {
        this.eventbus = ctx.get<EventBus>(AppBeans.EVENT_BUS);
        this.pending.forEach((observer) => {
            let sub = this.eventbus.subscribe(observer)
            // TODO what with subscription
        });
        this.pending = null;
    }

    @Context.Destroyed()
    contextDestroyed(ctx: Context) {
        // TODO
    }
}