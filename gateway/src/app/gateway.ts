import {GatewayConfigProvider, GatewayConfig} from "./gateway.config";
import {RegistrationService} from "./registration.service";
import {EventBus} from "./eventbus.service";
import {RestClient} from "./rest.client";

const CFG_FILE = 'cfg.json';

var $services = {};

(function ($services) {
    let $cfg_provider = new GatewayConfigProvider(CFG_FILE);
    $services['$cfg'] = $cfg_provider.get();
})($services);

(function ($services, $cfg: GatewayConfig) {
    let $rest = new RestClient($cfg.backendUrl);
    $services['$rest'] = $rest;
})(
    $services,
    $services['$cfg']
);

(function ($services, $rest: RestClient) {
    let $registration = new RegistrationService($rest);
    $services['$registration'] = $registration;
})(
    $services,
    $services['$rest']
);

(function ($services) {
    let $cfg = $services['$cfg'];
    let $eventbus = new EventBus($cfg.backendUrl);
    $services['$eventbus'] = $eventbus;
    $eventbus.start();
});//($services);

function error(err: any) {
    console.warn(`Uncaught error. ${err}`);
    throw err;
}

// Main
(function ($cfg, $registration) {
    console.log(`Staring gateway ${$cfg.uuid}`);

    $registration.register($cfg.uuid)
        .then((res) => {
            console.log(`Registering gateway ${$cfg.uuid}`);
        }, error);

    setTimeout(() => {
        $registration.deregister($cfg.uuid)
            .then((res) => {
                console.log(`Deregistering gateway ${$cfg.uuid}`);
            }, error);
    }, 5000);
})(
    $services['$cfg'],
    $services['$registration']
);