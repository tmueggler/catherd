import {Component, OnInit, OnDestroy} from "@angular/core";
import {NotificationComponentRegistry} from "./notification.service";

@Component({
    selector: 'notification',
    templateUrl: 'app/notification.component.html'
})
export class NotificationComponent implements OnInit, OnDestroy {
    _show = false;
    _success = false;
    _info = false;
    _warning = false;
    _danger = false;
    _message: string = null;

    constructor(private readonly registry: NotificationComponentRegistry) {
    }

    ngOnInit(): void {
        this.registry.add(this);
    }

    ngOnDestroy(): void {
        this.registry.remove(this);
    }

    dismiss() {
        this._show = false;
        this._success, this._info, this._warning, this._danger = false;
        this._message = null;
    }

    success(msg: string): void {
        this._message = msg;
        this._success = true;
        this._info, this._warning, this._danger = false;
        this._show = true;
    }

    info(msg: string): void {
        this._message = msg;
        this._info = true;
        this._success, this._warning, this._danger = false;
        this._show = true;
    }

    warning(msg: string): void {
        this._message = msg;
        this._warning = true;
        this._success , this._info, this._danger = false;
        this._show = true;
    }

    danger(msg: string): void {
        this._message = msg;
        this._danger = true;
        this._success, this._info, this._warning = false;
        this._show = true;
    }
}