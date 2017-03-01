import {BeanPostProcessor, BeanName, Context} from "@catherd/inject/node";
import {PartialObserver} from "rxjs/Observer";
import {EventBus, Event} from "./eventbus.service";
import "reflect-metadata";

export namespace eventbus {
    // Class Decorator
    export function Observer() {
        return (constructor: Function) => {
            Reflect.defineMetadata('eventbus:observer', true, constructor);
        }
    }
}

export class EventBusBeanPostProcessor implements BeanPostProcessor {
    private pending: PartialObserver<Event>[] = [];

    process(name: BeanName, instance: any): void {
        if (Reflect.hasMetadata('eventbus:observer', instance.constructor)) {
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
        this.eventbus = ctx.get<EventBus>('event-bus');
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