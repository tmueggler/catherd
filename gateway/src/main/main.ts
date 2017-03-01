import {EventBus} from "./eventbus/eventbus.service";
import {MessageBus} from "./messagebus/messagebus.service";
import {GatewayConfig, GatewayConfigProvider} from "./gateway.config";
import {RegistrationService} from "./registration.service";
import {RegistrationController} from "./registration/registration.controller";
import {MessageBusController} from "./messagebus/messagebus.controller";
import {Context, DefaultBeanFactory, BeanName, DefaultContext} from "@catherd/inject/node";
import {EventBusBeanPostProcessor} from "./eventbus/eventbus.beanpostprocessor";
import {AppLifecycleBeanPostProcessor} from "./applifecycle.beanpostprocessor";
import {AppBeans} from "./app.beans";

let $$factories = new DefaultBeanFactory();

$$factories.define({
    name: AppBeans.APP_CONFIG,
    create: () => {
        return new GatewayConfigProvider('cfg.json').get();
    }
});

$$factories.define({
    name: AppBeans.EVENT_BUS, create: () => {
        return new EventBus();
    }
});

$$factories.define({
    name: AppBeans.MESSAGE_BUS,
    create: (name: BeanName, ctx: Context) => {
        return new MessageBus(
            ctx.get<GatewayConfig>(AppBeans.APP_CONFIG).backendUrl,
            ctx.get<EventBus>(AppBeans.EVENT_BUS)
        );
    }
});

$$factories.define({
    name: 'message-bus-controller',
    create: (name: BeanName, ctx: Context) => {
        return new MessageBusController(
            ctx.get<MessageBus>(AppBeans.MESSAGE_BUS)
        );
    }
});

$$factories.define({
    name: AppBeans.REGISTRATION_SERVICE, create: (name: BeanName, ctx: Context) => {
        return new RegistrationService(
            ctx.get<GatewayConfig>(AppBeans.APP_CONFIG),
            ctx.get<MessageBus>(AppBeans.MESSAGE_BUS)
        );
    }
});

$$factories.define({
    name: 'registration-service-controller',
    create: (name: BeanName, ctx: Context) => {
        return new RegistrationController(
            ctx.get<RegistrationService>(AppBeans.REGISTRATION_SERVICE)
        )
    }
});

DefaultContext.initialize(
    $$factories,
    [
        new EventBusBeanPostProcessor(),
        new AppLifecycleBeanPostProcessor()
    ]
);