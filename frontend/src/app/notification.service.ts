import {Injectable} from "@angular/core";
import {NotificationComponent} from "./notification.component";

@Injectable()
export class NotificationComponentRegistry {
    private component: NotificationComponent;

    add(comp: NotificationComponent): void {
        this.component = comp;
    }

    remove(comp: NotificationComponent): void {
        this.component = comp;
    }

    success(msg: string): void {
        if (this.component) {
            this.component.success(msg);
        }
    }

    info(msg: string): void {
        if (this.component) {
            this.component.info(msg);
        }
    }

    warning(msg: string): void {
        if (this.component) {
            this.component.warning(msg);
        }
    }

    danger(msg: string): void {
        if (this.component) {
            this.component.danger(msg);
        }
    }
}

@Injectable()
export class NotificationService {
    constructor(private readonly registry: NotificationComponentRegistry) {
    }

    success(msg: string): void {
        this.registry.success(msg);
    }

    info(msg: string): void {
        this.registry.info(msg);
    }

    warning(msg: string): void {
        this.registry.warning(msg);
    }

    danger(msg: string): void {
        this.registry.danger(msg);
    }
}