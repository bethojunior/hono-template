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
exports.JwtProvider = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const tsyringe_1 = require("tsyringe");
let JwtProvider = class JwtProvider {
    secret = process.env.JWT_SECRET;
    expiresIn = (process.env.JWT_EXPIRATION_TIME ||
        '7d');
    refreshSecret = process.env.REFRESH_TOKEN_SECRET;
    refreshExpiresIn = (process.env.REFRESH_TOKEN_EXPIRATION_TIME ||
        '30d');
    sign(payload) {
        return jsonwebtoken_1.default.sign(payload, this.secret, { expiresIn: this.expiresIn });
    }
    verify(token) {
        return jsonwebtoken_1.default.verify(token, this.secret);
    }
    signRefreshToken(payload) {
        return jsonwebtoken_1.default.sign(payload, this.refreshSecret, { expiresIn: this.refreshExpiresIn });
    }
    verifyRefreshToken(token) {
        return jsonwebtoken_1.default.verify(token, this.refreshSecret);
    }
};
exports.JwtProvider = JwtProvider;
exports.JwtProvider = JwtProvider = __decorate([
    (0, tsyringe_1.injectable)()
], JwtProvider);
