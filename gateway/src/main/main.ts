import {DefaultFactory, DefaultContext, Type, Context} from "@catherd/inject/node";
import {EventBus} from "./eventbus/eventbus.service";
import {MessageBus} from "./messagebus/messagebus.service";
import {GatewayConfig, GatewayConfigProvider} from "./gateway.config";
import {RegistrationService} from "./registration.service";
import {AppEvent} from "./app.event";
import {MessageBusEvent} from "./messagebus/messagebus.event";

let $$factories = new DefaultFactory();

$$factories.register(GatewayConfig, () => {
    return new GatewayConfigProvider('cfg.json').get();
});

$$factories.register<EventBus>(EventBus, () => {
    return new EventBus();
});

$$factories.register<MessageBus>(MessageBus, (type: Type<MessageBus>, ctx: Context) => {
    return new MessageBus(
        ctx.get<GatewayConfig>(GatewayConfig).backendUrl,
        ctx.get<EventBus>(EventBus)
    );
});

$$factories.register<RegistrationService>(RegistrationService, (type: Type<MessageBus>, ctx: Context) => {
    let instance = new RegistrationService(
        ctx.get<GatewayConfig>(GatewayConfig),
        ctx.get<MessageBus>(MessageBus)
    );
    ctx.get<EventBus>(EventBus).subscribe((evt) => {
        switch (evt.type) {
            case MessageBusEvent.CONNECTED:
                instance.register();
                break;
            case MessageBusEvent.DISCONNECTED:
                instance.deregister();
                break;
            default:
                break;
        }
    });
    return instance;
});

let $$context = new DefaultContext($$factories.create.bind($$factories));
$$factories.register<Context>({name: 'Context'}, () => {
    return $$context;
});

let $$eventbus = $$context.get<EventBus>(EventBus);

$$eventbus.subscribe((evt) => {
    switch (evt.type) {
        case AppEvent.START:
            try {
                $$context.get<MessageBus>(MessageBus).start();
            } catch (e) {
                console.warn(e);
            }
            break;
        case AppEvent.STOP:
            $$context.get<MessageBus>(MessageBus).stop();
            break;
        default:
            break;
    }
});

// Start application by sending app start event
$$eventbus.start();
$$eventbus.send({type: AppEvent.START, src_id: null});