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
exports.EventBusProvider = void 0;
const client_1 = require("@prisma/client");
const tsyringe_1 = require("tsyringe");
const prisma_provider_1 = require("../prisma/prisma.provider");
const rabbitmq_provider_1 = require("../rabbitmq/rabbitmq.provider");
const events_1 = require("./events");
let EventBusProvider = class EventBusProvider {
    rabbitMqProvider;
    prismaProvider;
    constructor(rabbitMqProvider, prismaProvider) {
        this.rabbitMqProvider = rabbitMqProvider;
        this.prismaProvider = prismaProvider;
    }
    async connect() {
        await this.rabbitMqProvider.connect();
        const channel = this.rabbitMqProvider.getChannel();
        await channel.assertQueue(events_1.EVENTS_QUEUE, { durable: true });
        console.log('✅ EventBus conectado');
    }
    async emit(event, payload) {
        const savedEvent = await this.prismaProvider.event.create({
            data: {
                type: event,
                status: client_1.EventStatus.PENDING,
                payload: payload,
            },
        });
        try {
            const channel = this.rabbitMqProvider.getChannel();
            const message = {
                eventId: savedEvent.id,
                type: event,
                payload,
            };
            channel.sendToQueue(events_1.EVENTS_QUEUE, Buffer.from(JSON.stringify(message)), {
                persistent: true,
            });
            await this.updateEvent(savedEvent.id, { status: client_1.EventStatus.PUBLISHED });
        }
        catch (error) {
            await this.updateEvent(savedEvent.id, {
                status: client_1.EventStatus.FAILED_PUBLISH,
                failedReason: error instanceof Error ? error.message : String(error),
            });
            throw error;
        }
    }
    async updateEvent(eventId, data) {
        await this.prismaProvider.event.update({
            where: { id: eventId },
            data,
        });
    }
    async checkQueue() {
        try {
            const channel = this.rabbitMqProvider.getChannel();
            const result = await channel.checkQueue(events_1.EVENTS_QUEUE);
            return !!result;
        }
        catch (error) {
            console.error('❌ Fila não está respondendo', error);
            return false;
        }
    }
};
exports.EventBusProvider = EventBusProvider;
exports.EventBusProvider = EventBusProvider = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(rabbitmq_provider_1.RabbitMqProvider)),
    __param(1, (0, tsyringe_1.inject)(prisma_provider_1.PrismaProvider)),
    __metadata("design:paramtypes", [rabbitmq_provider_1.RabbitMqProvider, prisma_provider_1.PrismaProvider])
], EventBusProvider);
