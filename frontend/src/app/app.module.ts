import {NgModule} from "@angular/core";
import {BrowserModule} from "@angular/platform-browser";
import {AppComponent} from "./app.component";
import {Configuration} from "./app.config";
import {AppStateManager} from "./appstate.manager";
import {EventBus} from "./eventbus.service";

@NgModule({
    imports: [BrowserModule],
    declarations: [AppComponent],
    providers: [
        Configuration.AppCfg,
        AppStateManager,
        EventBus
    ],
    bootstrap: [AppComponent]
})
export class AppModule {
}