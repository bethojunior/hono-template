"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = void 0;
const tsyringe_1 = require("tsyringe");
const jwt_provider_1 = require("../providers/jwt/jwt.provider");
const jwtProvider = tsyringe_1.container.resolve(jwt_provider_1.JwtProvider);
const authMiddleware = async (c, next) => {
    const authHeader = c.req.header('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
        return c.json({ error: 'Token not provided' }, 401);
    }
    const token = authHeader.slice('Bearer '.length);
    try {
        const payload = jwtProvider.verify(token);
        c.set('user', payload);
    }
    catch {
        return c.json({ error: 'Invalid or expired token' }, 401);
    }
    await next();
};
exports.authMiddleware = authMiddleware;
