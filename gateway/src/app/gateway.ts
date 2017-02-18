import {GatewayConfigProvider} from "./gateway.config";
import {RegistrationService} from "./registration.service";
import {EventBus} from "./eventbus.service";

const CFG_FILE = 'cfg.json';

var $services = {};

(function ($services) {
    let $cfg_provider = new GatewayConfigProvider(CFG_FILE);
    $services['$cfg'] = $cfg_provider.get();
})($services);

(function ($services) {
    let $cfg = $services['$cfg'];
    let $registration = new RegistrationService($cfg.backendUrl);
    $services['$registration'] = $registration;
})($services);

(function ($services) {
    let $cfg = $services['$cfg'];
    let $eventbus = new EventBus($cfg.backendUrl);
    $services['$eventbus'] = $eventbus;
    $eventbus.start();
});//($services);

// Main
(function ($cfg, $registration) {
    $registration.register($cfg.uuid);
})(
    $services['$cfg'],
    $services['$registration']
);