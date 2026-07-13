"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventBusConsumer = void 0;
const client_1 = require("@prisma/client");
const tsyringe_1 = require("tsyringe");
const rabbitmq_provider_1 = require("../rabbitmq/rabbitmq.provider");
const events_1 = require("./events");
const event_bus_provider_1 = require("./event-bus.provider");
let EventBusConsumer = class EventBusConsumer {
    rabbitMqProvider;
    eventBusProvider;
    handlers = new Map();
    constructor(rabbitMqProvider, eventBusProvider) {
        this.rabbitMqProvider = rabbitMqProvider;
        this.eventBusProvider = eventBusProvider;
    }
    register(consumer) {
        this.handlers.set(consumer.eventType, consumer);
    }
    async start() {
        const channel = this.rabbitMqProvider.getChannel();
        await channel.assertQueue(events_1.EVENTS_QUEUE, { durable: true });
        await channel.prefetch(10);
        await channel.consume(events_1.EVENTS_QUEUE, (msg) => {
            if (!msg)
                return;
            void this.processMessage(msg, channel);
        });
        console.log(`✅ Consumindo eventos da fila "${events_1.EVENTS_QUEUE}"`);
    }
    async processMessage(msg, channel) {
        const message = JSON.parse(msg.content.toString());
        const handler = this.handlers.get(message.type);
        if (!handler) {
            console.warn(`⚠️ Nenhum consumer registrado para o evento "${message.type}"`);
            channel.nack(msg, false, false);
            return;
        }
        try {
            await this.eventBusProvider.updateEvent(message.eventId, { status: client_1.EventStatus.PROCESSING });
            await handler.handle(message);
            await this.eventBusProvider.updateEvent(message.eventId, { status: client_1.EventStatus.PROCESSED });
            channel.ack(msg);
        }
        catch (error) {
            await this.eventBusProvider.updateEvent(message.eventId, {
                status: client_1.EventStatus.FAILED_PROCESSING,
                failedReason: error instanceof Error ? error.message : String(error),
            });
            channel.nack(msg, false, false);
        }
    }
};
exports.EventBusConsumer = EventBusConsumer;
exports.EventBusConsumer = EventBusConsumer = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(rabbitmq_provider_1.RabbitMqProvider)),
    __param(1, (0, tsyringe_1.inject)(event_bus_provider_1.EventBusProvider)),
    __metadata("design:paramtypes", [rabbitmq_provider_1.RabbitMqProvider, event_bus_provider_1.EventBusProvider])
], EventBusConsumer);
