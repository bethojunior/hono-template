"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blogCacheKey = exports.BLOGS_CACHE_KEY = void 0;
exports.BLOGS_CACHE_KEY = 'blogs:all';
const blogCacheKey = (id) => `blogs:${id}`;
exports.blogCacheKey = blogCacheKey;
