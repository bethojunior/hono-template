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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheProvider = void 0;
const redis_1 = __importDefault(require("@keyv/redis"));
const cache_manager_1 = require("cache-manager");
const keyv_1 = __importDefault(require("keyv"));
const tsyringe_1 = require("tsyringe");
const DEFAULT_TTL = 24 * 60 * 60 * 1000;
let CacheProvider = class CacheProvider {
    cache;
    constructor() {
        const host = process.env.REDIS_HOST || 'localhost';
        const port = process.env.REDIS_PORT || '6379';
        const password = process.env.REDIS_PASSWORD;
        const auth = password ? `:${password}@` : '';
        this.cache = (0, cache_manager_1.createCache)({
            stores: [
                new keyv_1.default({
                    store: new redis_1.default(`redis://${auth}${host}:${port}`),
                    ttl: DEFAULT_TTL,
                }),
            ],
        });
    }
    async get(key) {
        return this.cache.get(key);
    }
    async set(key, value, ttl) {
        return this.cache.set(key, value, ttl);
    }
    async del(key) {
        return this.cache.del(key);
    }
    async wrap(key, fn, ttl) {
        return this.cache.wrap(key, fn, ttl);
    }
};
exports.CacheProvider = CacheProvider;
exports.CacheProvider = CacheProvider = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], CacheProvider);
