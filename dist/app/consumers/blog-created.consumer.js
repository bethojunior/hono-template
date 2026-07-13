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
exports.BlogCreatedConsumer = void 0;
const tsyringe_1 = require("tsyringe");
const blog_entity_1 = require("../entities/blog.entity");
const cache_provider_1 = require("../providers/cache/cache.provider");
const prisma_provider_1 = require("../providers/prisma/prisma.provider");
let BlogCreatedConsumer = class BlogCreatedConsumer {
    prismaProvider;
    cacheProvider;
    eventType = 'blog.created';
    constructor(prismaProvider, cacheProvider) {
        this.prismaProvider = prismaProvider;
        this.cacheProvider = cacheProvider;
    }
    async handle(message) {
        const { payload } = message;
        const blog = await this.prismaProvider.blog.create({
            data: {
                title: payload.title,
                content: payload.content,
            },
        });
        const cachedBlogs = await this.cacheProvider.get(blog_entity_1.BLOGS_CACHE_KEY);
        if (cachedBlogs) {
            await this.cacheProvider.set(blog_entity_1.BLOGS_CACHE_KEY, [...cachedBlogs, blog]);
        }
        console.log('blog created', blog);
    }
};
exports.BlogCreatedConsumer = BlogCreatedConsumer;
exports.BlogCreatedConsumer = BlogCreatedConsumer = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(prisma_provider_1.PrismaProvider)),
    __param(1, (0, tsyringe_1.inject)(cache_provider_1.CacheProvider)),
    __metadata("design:paramtypes", [prisma_provider_1.PrismaProvider, cache_provider_1.CacheProvider])
], BlogCreatedConsumer);
