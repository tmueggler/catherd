import {Subject, ConnectableObservable, Subscription} from "rxjs";
import {PartialObserver} from "rxjs/Observer";
import {Start, Stop} from "../app/applifecycle.beanpostprocessor";

export class EventBus {
    private readonly subject: Subject<Event>;
    private readonly publisher: ConnectableObservable<Event>;

    constructor() {
        this.subject = new Subject();
        this.publisher = this.subject.publish();
    }

    private connection: Subscription;

    @Start(0)
    start(): void {
        if (this.connection) {
            return;
        }
        this.connection = this.publisher.connect();
    }

    @Stop(0)
    stop(): void {
        if (!this.connection) {
            return;
        }
        this.connection.unsubscribe();
        this.connection = null;
    }

    send(evt: Event): void {
        this.subject.next(evt);
    }

    subscribe(observer: PartialObserver<Event>): Subscription {
        return this.publisher.subscribe(observer);
    }
}

export type EventType = number;

export interface Event {
    readonly type: EventType;
    readonly src_id: string;
}