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
exports.BlogService = void 0;
const tsyringe_1 = require("tsyringe");
const blog_entity_1 = require("../entities/blog.entity");
const http_error_1 = require("../errors/http-error");
const cache_provider_1 = require("../providers/cache/cache.provider");
const event_bus_provider_1 = require("../providers/event-bus/event-bus.provider");
const prisma_provider_1 = require("../providers/prisma/prisma.provider");
let BlogService = class BlogService {
    prismaProvider;
    cacheProvider;
    eventBusProvider;
    constructor(prismaProvider, cacheProvider, eventBusProvider) {
        this.prismaProvider = prismaProvider;
        this.cacheProvider = cacheProvider;
        this.eventBusProvider = eventBusProvider;
    }
    async store(data) {
        try {
            await this.eventBusProvider.emit('blog.created', {
                title: data.title,
                content: data.content,
            });
            return { message: 'Blog creation requested' };
        }
        catch (error) {
            if (error instanceof http_error_1.HttpError)
                throw error;
            throw new Error(`Error requesting blog creation: ${error}`);
        }
    }
    async findAll() {
        try {
            const cached = await this.cacheProvider.get(blog_entity_1.BLOGS_CACHE_KEY);
            if (cached)
                return cached;
            const blogs = await this.prismaProvider.blog.findMany();
            await this.cacheProvider.set(blog_entity_1.BLOGS_CACHE_KEY, blogs);
            return blogs;
        }
        catch (error) {
            if (error instanceof http_error_1.HttpError)
                throw error;
            throw new Error(`Error fetching blogs: ${error}`);
        }
    }
    async findOne(id) {
        try {
            const cached = await this.cacheProvider.get((0, blog_entity_1.blogCacheKey)(id));
            if (cached)
                return cached;
            const blog = await this.prismaProvider.blog.findUnique({ where: { id } });
            if (!blog)
                throw new http_error_1.NotFoundError('Blog not found');
            await this.cacheProvider.set((0, blog_entity_1.blogCacheKey)(id), blog);
            return blog;
        }
        catch (error) {
            if (error instanceof http_error_1.HttpError)
                throw error;
            throw new Error(`Error fetching blog: ${error}`);
        }
    }
    async update(id, data) {
        try {
            const blog = await this.prismaProvider.blog.update({ where: { id }, data });
            await this.cacheProvider.set((0, blog_entity_1.blogCacheKey)(id), blog);
            await this.cacheProvider.del(blog_entity_1.BLOGS_CACHE_KEY);
            return blog;
        }
        catch (error) {
            if (error instanceof http_error_1.HttpError)
                throw error;
            throw new Error(`Error updating blog: ${error}`);
        }
    }
    async remove(id) {
        try {
            const blog = await this.prismaProvider.blog.delete({ where: { id } });
            await this.cacheProvider.del((0, blog_entity_1.blogCacheKey)(id));
            await this.cacheProvider.del(blog_entity_1.BLOGS_CACHE_KEY);
            return blog;
        }
        catch (error) {
            if (error instanceof http_error_1.HttpError)
                throw error;
            throw new Error(`Error deleting blog: ${error}`);
        }
    }
};
exports.BlogService = BlogService;
exports.BlogService = BlogService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(prisma_provider_1.PrismaProvider)),
    __param(1, (0, tsyringe_1.inject)(cache_provider_1.CacheProvider)),
    __param(2, (0, tsyringe_1.inject)(event_bus_provider_1.EventBusProvider)),
    __metadata("design:paramtypes", [prisma_provider_1.PrismaProvider, cache_provider_1.CacheProvider, event_bus_provider_1.EventBusProvider])
], BlogService);
