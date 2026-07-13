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
exports.BlogController = void 0;
const tsyringe_1 = require("tsyringe");
const http_error_1 = require("../errors/http-error");
const blog_service_1 = require("../services/blog.service");
let BlogController = class BlogController {
    service;
    constructor(service) {
        this.service = service;
    }
    async index(c) {
        try {
            const blogs = await this.service.findAll();
            return c.json(blogs);
        }
        catch (error) {
            if (error instanceof http_error_1.HttpError) {
                return c.json({ error: error.message }, error.statusCode);
            }
            return c.json({ error: error.message }, 500);
        }
    }
    async store(c) {
        try {
            const body = c.get('body');
            const result = await this.service.store(body);
            return c.json(result, 202);
        }
        catch (error) {
            if (error instanceof http_error_1.HttpError) {
                return c.json({ error: error.message }, error.statusCode);
            }
            return c.json({ error: error.message }, 500);
        }
    }
    async show(c) {
        try {
            const id = c.req.param('id');
            if (!id) {
                return c.json({ error: 'Id é obrigatório' }, 400);
            }
            const blog = await this.service.findOne(id);
            return c.json(blog);
        }
        catch (error) {
            if (error instanceof http_error_1.HttpError) {
                return c.json({ error: error.message }, error.statusCode);
            }
            return c.json({ error: error.message }, 500);
        }
    }
    async update(c) {
        try {
            const id = c.req.param('id');
            if (!id) {
                return c.json({ error: 'Id é obrigatório' }, 400);
            }
            const body = c.get('body');
            const blog = await this.service.update(id, body);
            return c.json(blog);
        }
        catch (error) {
            if (error instanceof http_error_1.HttpError) {
                return c.json({ error: error.message }, error.statusCode);
            }
            return c.json({ error: error.message }, 500);
        }
    }
    async destroy(c) {
        try {
            const id = c.req.param('id');
            if (!id) {
                return c.json({ error: 'Id é obrigatório' }, 400);
            }
            await this.service.remove(id);
            return c.body(null, 204);
        }
        catch (error) {
            if (error instanceof http_error_1.HttpError) {
                return c.json({ error: error.message }, error.statusCode);
            }
            return c.json({ error: error.message }, 500);
        }
    }
};
exports.BlogController = BlogController;
exports.BlogController = BlogController = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(blog_service_1.BlogService)),
    __metadata("design:paramtypes", [blog_service_1.BlogService])
], BlogController);
