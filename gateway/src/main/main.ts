import {EventBus} from "./eventbus/eventbus.service";
import {MessageBus, DefaultMessageBus} from "./messagebus/messagebus.service";
import {GatewayConfig, GatewayConfigProvider} from "./gateway.config";
import {StateController} from "./state/state.controller";
import {MessageBusController} from "./messagebus/messagebus.controller";
import {Context, DefaultBeanFactory, BeanName, DefaultContext} from "@catherd/inject/node";
import {EventBusBeanPostProcessor} from "./eventbus/eventbus.beanpostprocessor";
import {AppLifecycleBeanPostProcessor} from "./app/applifecycle.beanpostprocessor";
import {AppBeans} from "./app/app.beans";

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
        return new DefaultMessageBus(
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
    name: 'registration-service-controller',
    create: (name: BeanName, ctx: Context) => {
        return new StateController(
            ctx.get<GatewayConfig>(AppBeans.APP_CONFIG),
            ctx.get<MessageBus>(AppBeans.MESSAGE_BUS)
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