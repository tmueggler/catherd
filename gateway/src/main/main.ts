import {EventBus} from "./eventbus/eventbus.service";
import {MessageBus} from "./messagebus/messagebus.service";
import {GatewayConfig, GatewayConfigProvider} from "./gateway.config";
import {RegistrationService} from "./registration.service";
import {RegistrationController} from "./registration/registration.controller";
import {MessageBusController} from "./messagebus/messagebus.controller";
import {Context, DefaultBeanFactory, BeanName, DefaultContext} from "@catherd/inject/node";
import {EventBusBeanPostProcessor} from "./eventbus/eventbus.beanpostprocessor";

let $$factories = new DefaultBeanFactory();

const GATEWAYCONFIG_BEAN = GatewayConfig.name;
$$factories.define({
    name: GATEWAYCONFIG_BEAN,
    create: () => {
        return new GatewayConfigProvider('cfg.json').get();
    }
});

const EVENTBUS_BEAN = EventBus.name;
$$factories.define({
    name: EVENTBUS_BEAN, create: () => {
        return new EventBus();
    }
});

const MESSAGEBUS_BEAN = MessageBus.name;
$$factories.define({
    name: MESSAGEBUS_BEAN,
    create: (name: BeanName, ctx: Context) => {
        return new MessageBus(
            ctx.get<GatewayConfig>(GATEWAYCONFIG_BEAN).backendUrl,
            ctx.get<EventBus>(EVENTBUS_BEAN)
        );
    }
});

const MESSAGEBUS_CONTROLLER_BEAN = MessageBusController.name;
$$factories.define({
    name: MESSAGEBUS_CONTROLLER_BEAN,
    create: (name: BeanName, ctx: Context) => {
        return new MessageBusController(
            ctx.get<MessageBus>(MESSAGEBUS_BEAN)
        );
    }
});

const REGISTRATIONSERVICE_BEAN = RegistrationService.name;
$$factories.define({
    name: REGISTRATIONSERVICE_BEAN, create: (name: BeanName, ctx: Context) => {
        return new RegistrationService(
            ctx.get<GatewayConfig>(GATEWAYCONFIG_BEAN),
            ctx.get<MessageBus>(MESSAGEBUS_BEAN)
        );
    }
});

const REGISTRATIONSERVICE_CONTROLLER_BEAN = RegistrationController.name;
$$factories.define({
    name: REGISTRATIONSERVICE_CONTROLLER_BEAN,
    create: (name: BeanName, ctx: Context) => {
        return new RegistrationController(
            ctx.get<RegistrationService>(REGISTRATIONSERVICE_BEAN)
        )
    }
});

DefaultContext.initialize($$factories, [new EventBusBeanPostProcessor()]);