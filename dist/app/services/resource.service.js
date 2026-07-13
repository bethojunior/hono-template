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
exports.ResourceService = void 0;
const tsyringe_1 = require("tsyringe");
const prisma_provider_1 = require("../providers/prisma/prisma.provider");
const s3_provider_1 = require("../providers/s3/s3.provider");
let ResourceService = class ResourceService {
    prismaProvider;
    s3Provider;
    constructor(prismaProvider, s3Provider) {
        this.prismaProvider = prismaProvider;
        this.s3Provider = s3Provider;
    }
    async store(file, flow) {
        try {
            const fileName = `${Date.now()}-${file.name}`;
            const key = flow ? `${flow}/${fileName}` : `default/${fileName}`;
            const buffer = Buffer.from(await file.arrayBuffer());
            await this.s3Provider.uploadBuffer(buffer, key, file.type);
            const fileUrl = `${process.env.S3_ENDPOINT}/${process.env.S3_BUCKET_NAME}/${key}`;
            return await this.prismaProvider.resource.create({
                data: { url: fileUrl },
            });
        }
        catch (error) {
            throw new Error(`Error storing resource: ${error}`);
        }
    }
    async findOne(id) {
        try {
            return await this.prismaProvider.resource.findUnique({ where: { id } });
        }
        catch (error) {
            throw new Error(`Error fetching resource: ${error}`);
        }
    }
    async delete(id) {
        try {
            const resource = await this.prismaProvider.resource.findUnique({ where: { id } });
            if (!resource || !resource.url) {
                throw new Error('Resource not found');
            }
            const key = resource.url.split(`/${process.env.S3_BUCKET_NAME}/`)[1];
            await this.s3Provider.deleteFile(key);
            return await this.prismaProvider.resource.delete({ where: { id } });
        }
        catch (error) {
            throw new Error(`Error deleting resource: ${error}`);
        }
    }
};
exports.ResourceService = ResourceService;
exports.ResourceService = ResourceService = __decorate([
    (0, tsyringe_1.injectable)(),
    __param(0, (0, tsyringe_1.inject)(prisma_provider_1.PrismaProvider)),
    __param(1, (0, tsyringe_1.inject)(s3_provider_1.S3Provider)),
    __metadata("design:paramtypes", [prisma_provider_1.PrismaProvider, s3_provider_1.S3Provider])
], ResourceService);
