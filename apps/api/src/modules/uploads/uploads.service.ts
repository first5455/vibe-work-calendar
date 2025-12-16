import { S3Client, PutObjectCommand, DeleteObjectCommand, HeadBucketCommand, CreateBucketCommand, PutBucketPolicyCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "node:crypto";
import { config } from "../../config/env";

const BUCKET_NAME = config.MINIO_BUCKET;

const s3Client = new S3Client({
    region: "us-east-1", // MinIO default
    endpoint: config.MINIO_ENDPOINT,
    credentials: {
        accessKeyId: config.MINIO_ROOT_USER,
        secretAccessKey: config.MINIO_ROOT_PASSWORD
    },
    forcePathStyle: true // Needed for MinIO
});

export const UploadService = {
  async saveFile(file: Blob, folder: string = "general") {
    const buffer = await file.arrayBuffer();
    const ext = file.type.split("/")[1] || "bin";
    const filename = `${randomUUID()}.${ext}`;
    const key = `${folder}/${filename}`;

    await s3Client.send(new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
        Body: Buffer.from(buffer),
        ContentType: file.type
    }));

    // Construct public URL
    // Assuming bucket is public or we want to access via the endpoint directly
    const endpoint = config.MINIO_PUBLIC_URL;
    const url = `${endpoint}/${BUCKET_NAME}/${key}`;

    return {
      url,
      key
    };
  },

  async deleteFile(fileUrlOrKey: string) {
    try {
      let key = fileUrlOrKey;
      // Heuristic to extract key from URL if full URL is passed
      if (fileUrlOrKey.startsWith("http")) {
          const bucketPart = `/${BUCKET_NAME}/`;
          if (fileUrlOrKey.includes(bucketPart)) {
              key = fileUrlOrKey.split(bucketPart)[1];
          }
      }

      if (!key) return;

      await s3Client.send(new DeleteObjectCommand({
          Bucket: BUCKET_NAME,
          Key: key
      }));
      
      return true;
    } catch (e) {
      console.warn(`Failed to delete file from S3: ${fileUrlOrKey}`, e);
      return false;
    }
  },

  async initializeBucket() {
    try {
        console.log(`Checking bucket: ${BUCKET_NAME}`);
        try {
            await s3Client.send(new HeadBucketCommand({ Bucket: BUCKET_NAME }));
            console.log(`Bucket ${BUCKET_NAME} exists.`);
        } catch (e) {
            console.log(`Bucket ${BUCKET_NAME} not found, creating...`);
            await s3Client.send(new CreateBucketCommand({ Bucket: BUCKET_NAME }));
            console.log(`Bucket ${BUCKET_NAME} created.`);
        }

        // Set public read policy
        const policy = {
            Version: "2012-10-17",
            Statement: [
                {
                    Sid: "PublicRead",
                    Effect: "Allow",
                    Principal: "*",
                    Action: ["s3:GetObject"],
                    Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`]
                }
            ]
        };

        await s3Client.send(new PutBucketPolicyCommand({
            Bucket: BUCKET_NAME,
            Policy: JSON.stringify(policy)
        }));
        console.log(`Public read policy set for bucket ${BUCKET_NAME}.`);

    } catch (e) {
        console.error("Failed to initialize MinIO bucket:", e);
    }
  }
};
