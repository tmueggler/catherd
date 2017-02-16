import {Component, OnInit, OnDestroy} from "@angular/core";
import {AppStateManager} from "./appstate.manager";

@Component({
    selector: 'ng-app',
    templateUrl: 'app/app.component.html'
})
export class AppComponent implements OnInit, OnDestroy {
    constructor(private stateManager: AppStateManager) {
    }

    ngOnInit() {
        this.stateManager.start();
    }

    ngOnDestroy() {
        this.stateManager.stop();
    }
}