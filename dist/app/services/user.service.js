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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = require("crypto");
const tsyringe_1 = require("tsyringe");
const http_error_1 = require("../errors/http-error");
const event_bus_provider_1 = require("../providers/event-bus/event-bus.provider");
const jwt_provider_1 = require("../providers/jwt/jwt.provider");
const prisma_provider_1 = require("../providers/prisma/prisma.provider");
const SALT_ROUNDS = 10;
function hashRefreshToken(token) {
    return (0, crypto_1.createHash)('sha256').update(token).digest('hex');
}
function refreshTokenMatches(token, hashed) {
    const candidate = Buffer.from(hashRefreshToken(token));
    const stored = Buffer.from(hashed);
    return candidate.length === stored.length && (0, crypto_1.timingSafeEqual)(candidate, stored);
}
let UserService = class UserService {
    prismaProvider;
    jwtProvider;
    eventBusProvider;
    constructor(prismaProvider, jwtProvider, eventBusProvider) {
        this.prismaProvider = prismaProvider;
        this.jwtProvider = jwtProvider;
        this.eventBusProvider = eventBusProvider;
    }
    async login(email, password) {
        try {
            const user = await this.prismaProvider.user.findUnique({
                where: { email },
            });
            if (!user)
                throw new http_error_1.NotFoundError('User not found');
            if (user.deletedAt)
                throw new http_error_1.UnauthorizedError('User account is deactivated');
            const isPasswordValid = await bcrypt_1.default.compare(password, user.password);
            if (!isPasswordValid)
                throw new http_error_1.UnauthorizedError('Invalid credentials');
            const accessToken = this.jwtProvider.sign({ sub: user.id, email: user.email });
            const refreshToken = this.jwtProvider.signRefreshToken({ sub: user.id, email: user.email });
            await this.prismaProvider.user.update({
                where: { id: user.id },
                data: { refreshToken: hashRefreshToken(refreshToken) },
            });
            const { password: _password, refreshToken: _refreshToken, ...userWithoutPassword } = user;
            return { user: userWithoutPassword, accessToken, refreshToken };
        }
        catch (error) {
            throw error;
        }
    }
    async refreshToken(refreshToken) {
        try {
            let payload;
            try {
                payload = this.jwtProvider.verifyRefreshToken(refreshToken);
            }
            catch {
                throw new http_error_1.UnauthorizedError('Invalid or expired refresh token');
            }
            const user = await this.prismaProvider.user.findUnique({
                where: { id: payload.sub },
            });
            if (!user || user.deletedAt)
                throw new http_error_1.UnauthorizedError('Invalid or expired refresh token');
            if (!user.refreshToken)
                throw new http_error_1.UnauthorizedError('Invalid or expired refresh token');
            const isRefreshTokenValid = refreshTokenMatches(refreshToken, user.refreshToken);
            if (!isRefreshTokenValid)
                throw new http_error_1.UnauthorizedError('Invalid or expired refresh token');
            const accessToken = this.jwtProvider.sign({ sub: user.id, email: user.email });
            const newRefreshToken = this.jwtProvider.signRefreshToken({
                sub: user.id,
                email: user.email,
            });
            await this.prismaProvider.user.update({
                where: { id: user.id },
                data: { refreshToken: hashRefreshToken(newRefreshToken) },
            });
            return { accessToken, refreshToken: newRefreshToken };
        }
        catch (error) {
            throw error;
        }
    }
    async logout(userId) {
        try {
            await this.prismaProvider.user.update({
                where: { id: userId },
                data: { refreshToken: null },
            });
        }
        catch (error) {
            throw error;
        }
    }
    async findAll() {
        try {
            return await this.prismaProvider.user.findMany();
        }
        catch (error) {
            throw error;
        }
    }
    async store(data) {
        try {
            const validateEmail = await this.prismaProvider.user.findUnique({
                where: { email: data.email },
            });
            if (validateEmail) {
                throw new http_error_1.ConflictError('Email already exists');
            }
            const hashedPassword = await bcrypt_1.default.hash(data.password, SALT_ROUNDS);
            const exec = await this.prismaProvider.user.create({
                data: {
                    name: data.name,
                    email: data.email,
                    password: hashedPassword,
                    resourceId: data.resourceId || null,
                },
                include: {
                    resource: true,
                },
            });
            const { password: _password, refreshToken: _refreshToken, ...userWithoutPassword } = exec;
            try {
                await this.eventBusProvider.emit('user.created', {
                    name: exec.name,
                    email: exec.email,
                });
            }
            catch (error) {
                console.error('❌ Falha ao publicar evento user.created', error);
            }
            return userWithoutPassword;
        }
        catch (error) {
            throw error;
        }
    }
};
exports.UserService = UserService;
exports.UserService = UserService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(prisma_provider_1.PrismaProvider)),
    __param(1, (0, tsyringe_1.inject)(jwt_provider_1.JwtProvider)),
    __param(2, (0, tsyringe_1.inject)(event_bus_provider_1.EventBusProvider)),
    __metadata("design:paramtypes", [prisma_provider_1.PrismaProvider, jwt_provider_1.JwtProvider, event_bus_provider_1.EventBusProvider])
], UserService);
