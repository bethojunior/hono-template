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
exports.ResourceController = void 0;
const tsyringe_1 = require("tsyringe");
const resource_service_1 = require("../services/resource.service");
let ResourceController = class ResourceController {
    service;
    constructor(service) {
        this.service = service;
    }
    async store(c) {
        try {
            const body = await c.req.parseBody();
            const file = body.file;
            if (!(file instanceof File)) {
                return c.json({ error: 'Arquivo é obrigatório' }, 400);
            }
            const flow = typeof body.flow === 'string' ? body.flow : undefined;
            const resource = await this.service.store(file, flow);
            return c.json(resource, 201);
        }
        catch (error) {
            return c.json({ error: error.message }, 500);
        }
    }
    async show(c) {
        try {
            const id = c.req.param('id');
            if (!id) {
                return c.json({ error: 'Id é obrigatório' }, 400);
            }
            const resource = await this.service.findOne(id);
            if (!resource) {
                return c.json({ error: 'Arquivo não encontrado' }, 404);
            }
            return c.json(resource);
        }
        catch (error) {
            return c.json({ error: error.message }, 500);
        }
    }
    async destroy(c) {
        try {
            const id = c.req.param('id');
            if (!id) {
                return c.json({ error: 'Id é obrigatório' }, 400);
            }
            await this.service.delete(id);
            return c.body(null, 204);
        }
        catch (error) {
            return c.json({ error: error.message }, 500);
        }
    }
};
exports.ResourceController = ResourceController;
exports.ResourceController = ResourceController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(resource_service_1.ResourceService)),
    __metadata("design:paramtypes", [resource_service_1.ResourceService])
], ResourceController);
