"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDto = validateDto;
const class_transformer_1 = require("class-transformer");
const class_validator_1 = require("class-validator");
function validateDto(dtoClass) {
    return async (c, next) => {
        const body = await c.req.json();
        const dto = (0, class_transformer_1.plainToInstance)(dtoClass, body);
        const errors = await (0, class_validator_1.validate)(dto, {
            whitelist: true,
            forbidNonWhitelisted: true,
        });
        if (errors.length > 0) {
            const formatted = Object.fromEntries(errors.map((error) => [error.property, Object.values(error.constraints ?? {})[0]]));
            return c.json({
                message: 'Validation failed',
                errors: formatted,
            }, 400);
        }
        c.set('body', dto);
        await next();
    };
}
