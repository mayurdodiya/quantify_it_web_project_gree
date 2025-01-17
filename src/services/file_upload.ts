import fs from "fs";
import multer from "multer";
import B2 from "backblaze-b2";
import logger from "../utils/winston";
import bucket from "../config/variables/bucket.json";
const bucketConfigurations = bucket;

const applicationKeyId: string = bucketConfigurations.BACKBLAZE_APPLICATION_KEY_ID || "your_default_key_id";
const applicationKey: string = bucketConfigurations.BACKBLAZE_APPLICATION_KEY || "your_default_key";

const b2 = new B2({
  applicationKeyId,
  applicationKey,
});

const path = "./uploads/image";

if (!fs.existsSync(path)) {
  fs.mkdirSync(path, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path);
  },
  filename: (req, file, cb) => {
    const imageNameModify = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = file.mimetype.split("/")[1];
    cb(null, `${file.fieldname}-${imageNameModify}.${extension}`);
  },
});

export const imageUpload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter(req, file, cb) {
    const isImage = /\.(png|jpg|jpeg)$/i.test(file.originalname);
    if (!isImage) {
      return cb(new Error("Please upload an image"));
    }
    cb(null, true);
  },
});

export class FileService {
  public async uploadFileInS3(
    folderName: string,
    files: Express.Multer.File[]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any[]> {
    await b2.authorize();
    try {
      const allFiles = await Promise.all(files.map((file) => this.uploadFile(folderName, file)));
      return allFiles;
    } catch (error) {
      throw new Error(`Failed to upload files: ${error.message}`);
    }
  }

  private async streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
    const chunks: Uint8Array[] = [];
    return new Promise((resolve, reject) => {
      stream
        .on("error", reject)
        .on("data", (chunk) => chunks.push(chunk))
        .on("end", () => resolve(Buffer.concat(chunks)));
    });
  }

  public async uploadFile(
    folderName: string,
    file: Express.Multer.File,
    fileName: string = ""
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    await b2.authorize();
    try {
      const data = await b2.getUploadUrl({
        bucketId: bucketConfigurations.BLACKBLAZE_BUCKETID,
      });
      const fileBuffer = await this.streamToBuffer(fs.createReadStream(file.path));
      const filename = fileName || file.originalname;

      const response = await b2.uploadFile({
        uploadUrl: data.data.uploadUrl,
        uploadAuthToken: data.data.authorizationToken,
        fileName: `${folderName}/${filename}`,
        data: fileBuffer,
        contentLength: fileBuffer.length,
      });

      return {
        fileName: `${bucketConfigurations.BACKBLAZE_ACCESS_URL}${response.data.fileName}`,
        fileId: response.data.fileId,
      };
    } catch (error) {
      logger.error(error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  public async uploadFileBase64(
    folderName: string,
    file: string,
    fileName: string = ""
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> {
    await b2.authorize();
    try {
      const fileList = await b2.listFileNames({
        bucketId: bucketConfigurations.BLACKBLAZE_BUCKETID as string,
        prefix: folderName,
        startFileName: "",
        maxFileCount: 1000,
        delimiter: "",
      });

      for (const fileItem of fileList.data.files) {
        await b2.deleteFileVersion({
          fileId: fileItem.fileId,
          fileName: fileItem.fileName,
        });
      }

      const data = await b2.getUploadUrl({
        bucketId: bucketConfigurations.BLACKBLAZE_BUCKETID,
      });
      const [base64Header, base64Data] = file.split(";base64,");
      const extension = base64Header.split("/")[1];
      const buffer = Buffer.from(base64Data, "base64");
      const filename = fileName || `${Date.now()}.${extension}`;

      const response = await b2.uploadFile({
        uploadUrl: data.data.uploadUrl,
        uploadAuthToken: data.data.authorizationToken,
        fileName: `${folderName}/${filename}`,
        data: buffer,
        contentLength: buffer.length,
      });

      return {
        fileName: `${bucketConfigurations.BACKBLAZE_ACCESS_URL}${response.data.fileName}`,
        fileId: response.data.fileId,
      };
    } catch (error) {
      throw new Error(`Failed to upload base64 file: ${error.message}`);
    }
  }
}
