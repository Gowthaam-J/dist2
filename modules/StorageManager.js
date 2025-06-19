"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadFileToS3 = uploadFileToS3;
exports.saveFileLinkToDB = saveFileLinkToDB;
const client_s3_1 = require("@aws-sdk/client-s3");
const pg_1 = require("pg");
const fs_1 = __importDefault(require("fs"));
const logger_1 = require("../logger");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_S3_BUCKET_NAME, POSTGRES_CONNECTION_STRING, } = process.env;
if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_REGION || !AWS_S3_BUCKET_NAME) {
    throw new Error('AWS S3 environment variables are not properly set.');
}
if (!POSTGRES_CONNECTION_STRING) {
    throw new Error('PostgreSQL connection string is not set.');
}
const s3Client = new client_s3_1.S3Client({
    region: AWS_REGION,
    credentials: {
        accessKeyId: AWS_ACCESS_KEY_ID,
        secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
});
const pgClient = new pg_1.Client({
    connectionString: POSTGRES_CONNECTION_STRING,
    ssl: {
        rejectUnauthorized: false,
    },
});
pgClient.connect().catch(err => {
    logger_1.logger.error('Failed to connect to PostgreSQL:', err);
    process.exit(1);
});
async function uploadFileToS3(filePath, key) {
    const fileStream = fs_1.default.createReadStream(filePath);
    const params = {
        Bucket: AWS_S3_BUCKET_NAME,
        Key: key,
        Body: fileStream,
    };
    try {
        await s3Client.send(new client_s3_1.PutObjectCommand(params));
        const s3Url = `https://${AWS_S3_BUCKET_NAME}.s3.${AWS_REGION}.amazonaws.com/${key}`;
        logger_1.logger.info(`File uploaded to S3: ${s3Url}`);
        return s3Url;
    }
    catch (error) {
        logger_1.logger.error('Failed to upload file to S3:', error);
        throw error;
    }
}
async function saveFileLinkToDB(metadata) {
    const query = `
    INSERT INTO spaces (space_id, s3_url)
    VALUES ($1, $2)
    ON CONFLICT (space_id) DO UPDATE SET
      s3_url = EXCLUDED.s3_url
  `;
    const values = [
        metadata.space_id || null,
        metadata.s3_url,
    ];
    try {
        await pgClient.query(query, values);
        logger_1.logger.info(`Metadata saved to DB for space_id: ${metadata.space_id}`);
    }
    catch (error) {
        logger_1.logger.error('Failed to save metadata to DB:', error);
        throw error;
    }
}
//# sourceMappingURL=StorageManager.js.map