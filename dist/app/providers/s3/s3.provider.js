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
Object.defineProperty(exports, "__esModule", { value: true });
exports.S3Provider = void 0;
const client_s3_1 = require("@aws-sdk/client-s3");
const tsyringe_1 = require("tsyringe");
let S3Provider = class S3Provider {
    s3;
    bucket = process.env.S3_BUCKET_NAME;
    ready;
    constructor() {
        this.s3 = new client_s3_1.S3Client({
            region: process.env.S3_REGION,
            endpoint: process.env.S3_ENDPOINT,
            forcePathStyle: true,
            credentials: {
                accessKeyId: process.env.S3_ACCESS_KEY_ID,
                secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
            },
        });
        this.ready = this.ensureBucket();
    }
    async ensureBucket() {
        try {
            await this.s3.send(new client_s3_1.HeadBucketCommand({ Bucket: this.bucket }));
        }
        catch {
            await this.s3.send(new client_s3_1.CreateBucketCommand({ Bucket: this.bucket }));
        }
        await this.s3.send(new client_s3_1.PutBucketPolicyCommand({
            Bucket: this.bucket,
            Policy: JSON.stringify({
                Version: '2012-10-17',
                Statement: [
                    {
                        Effect: 'Allow',
                        Principal: { AWS: ['*'] },
                        Action: ['s3:GetBucketLocation', 's3:ListBucket', 's3:GetObject'],
                        Resource: [`arn:aws:s3:::${this.bucket}`, `arn:aws:s3:::${this.bucket}/*`],
                    },
                ],
            }),
        }));
    }
    async uploadBuffer(buffer, key, contentType) {
        await this.ready;
        const uploadParams = {
            Bucket: this.bucket,
            Key: key,
            Body: buffer,
            ContentType: contentType,
        };
        await this.s3.send(new client_s3_1.PutObjectCommand(uploadParams));
    }
    async deleteFile(key) {
        await this.ready;
        const deleteParams = {
            Bucket: this.bucket,
            Key: key,
        };
        await this.s3.send(new client_s3_1.DeleteObjectCommand(deleteParams));
    }
    async deleteMultipleFiles(keys) {
        await Promise.all(keys.map((key) => this.deleteFile(key)));
    }
};
exports.S3Provider = S3Provider;
exports.S3Provider = S3Provider = __decorate([
    (0, tsyringe_1.injectable)(),
    __metadata("design:paramtypes", [])
], S3Provider);
