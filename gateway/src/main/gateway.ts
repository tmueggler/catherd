import {GatewayConfigProvider, GatewayConfig} from "./gateway.config";
import {RegistrationService} from "./registration.service";
import {MessageBus} from "./messagebus.service";
import {RestClient} from "./rest.client";

const CFG_FILE = 'cfg.json';

type ServiceRegistry = {[type: string]: any};

let $services: ServiceRegistry = {};

(function ($services: ServiceRegistry): void {
    let $cfg_provider = new GatewayConfigProvider(CFG_FILE);
    $services['$cfg'] = $cfg_provider.get();
})($services);

(function ($services: ServiceRegistry, $cfg: GatewayConfig): void {
    let $rest = new RestClient($cfg.backendUrl);
    $services['$rest'] = $rest;
})(
    $services,
    $services['$cfg']
);

(function ($services: ServiceRegistry): void {
    let $cfg = $services['$cfg'];
    let $eventbus = new MessageBus($cfg.backendUrl);
    $services['$messaging'] = $eventbus;
    $eventbus.start();
})($services);

(function ($services: ServiceRegistry, $cfg: GatewayConfig, $messaging: MessageBus): void {
    let $registration = new RegistrationService($cfg, $messaging);
    $services['$registration'] = $registration;
})(
    $services,
    $services['$cfg'],
    $services['$messaging']
);

function error(err: any): void {
    console.warn(`Uncaught error. ${err}`);
    throw err;
}

// Main
(function ($cfg: GatewayConfig, $registration: RegistrationService): void {
    console.log(`Staring gateway ${$cfg.uuid}`);

    $registration.register($cfg.uuid);

    // setTimeout(() => {
    //     $registration.deregister($cfg.uuid)
    //         .then((res) => {
    //             console.log(`Deregistering gateway ${$cfg.uuid}`);
    //         }, error);
    // }, 5000);
})(
    $services['$cfg'],
    $services['$registration']
);