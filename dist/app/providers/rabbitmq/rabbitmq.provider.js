"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RabbitMqProvider = void 0;
const amqplib_1 = __importDefault(require("amqplib"));
const tsyringe_1 = require("tsyringe");
let RabbitMqProvider = class RabbitMqProvider {
    connection = null;
    channel = null;
    async connect() {
        if (this.channel)
            return;
        const url = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
        this.connection = await amqplib_1.default.connect(url);
        this.channel = await this.connection.createChannel();
        this.connection.on('error', (err) => {
            console.error('❌ RabbitMQ connection error', err);
        });
        this.connection.on('close', () => {
            console.warn('⚠️ RabbitMQ connection closed');
            this.channel = null;
            this.connection = null;
        });
    }
    getChannel() {
        if (!this.channel) {
            throw new Error('RabbitMQ channel is not initialized. Call connect() first.');
        }
        return this.channel;
    }
    async close() {
        await this.channel?.close();
        await this.connection?.close();
        this.channel = null;
        this.connection = null;
    }
};
exports.RabbitMqProvider = RabbitMqProvider;
exports.RabbitMqProvider = RabbitMqProvider = __decorate([
    (0, tsyringe_1.injectable)()
], RabbitMqProvider);
