import fs from "fs";
import multer from "multer";
import B2 from "backblaze-b2";

const applicationKeyId: string | undefined = process.env.BACKBLAZE_APPLICATION_KEY || "17bd792484b7";
const applicationKey: string | undefined = process.env.BACKBLAZE_APPLICATION_KEY || "0050ce02c71cb8c1779dcf67fc3b43a0d7b7d96e53";

const b2 = new B2({
  applicationKeyId: applicationKeyId,
  applicationKey: applicationKey,
});

const path = "./uploads/image";

if (!fs.existsSync(path)) {
  fs.mkdirSync(path, { recursive: true });
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/image");
  },
  filename: function (req, file, cb) {
    const imageNameModify = Date.now() + "-" + Math.round(Math.random() * 1e9);

    cb(null, `${file.fieldname}-${imageNameModify}.${file.mimetype.split("/")[1]}`);
  },
});

export const imageUpload = multer({
  storage: storage,
  limits: {
    fileSize: 5000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
      return cb(new Error("Please upload a Image"));
    }
    cb(undefined, true);
  },
});

export class FileService {
  constructor() {
    const me = this;
  }
  public async uploadFileInS3(folderName: string, files: any): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        await b2.authorize();
        const allFiles = await Promise.all(
          files.map(async (file: any) => {
            return await this.uploadFile(folderName, file);
          })
        );
        resolve(allFiles || []);
      } catch (error: any) {
        reject(error.message);
      }
    });
  }

  async streamToBuffer(stream: any): Promise<Buffer> {
    const buffer: Uint8Array[] = [];

    return await new Promise((resolve, reject) =>
      stream
        .on("error", (error: any) => reject(error))
        .on("data", (data: any) => buffer.push(data))
        .on("end", () => resolve(Buffer.concat(buffer)))
    );
  }

  public async uploadFile(folderName: string, file: any, fileName: any = ""): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        await b2.authorize();
        const data = await b2.getUploadUrl({
          bucketId: process.env.BLACKBLAZE_BUCKETID,
        });

        const readDataData = await this.streamToBuffer(fs.createReadStream(file));

        const filename = fileName || file;
        const response = await b2.uploadFile({
          uploadUrl: data.data.uploadUrl,
          uploadAuthToken: data.data.authorizationToken,
          fileName: `${folderName}/${filename}`,
          data: readDataData,
          contentLength: 1000000000,
        });
        resolve({ fileName: `${process.env.BACKBLAZE_ACCESS_URL}${response.data.fileName}`, fileId: response?.data?.fileId });
      } catch (error: any) {
        reject(error.message);
      }
    });
  }

  async uploadFileBase64(folderName: string, file: any, fileName: any = ""): Promise<any> {
    return new Promise(async (resolve, reject) => {
      try {
        await b2.authorize();

        const fileList = await b2.listFileNames({
          bucketId: process.env.BLACKBLAZE_BUCKETID,
          prefix: folderName,
        });

        for (const file of fileList.data.files) {
          await b2.deleteFileVersion({
            fileId: file.fileId,
            fileName: file.fileName,
          });
        }

        const data = await b2.getUploadUrl({
          bucketId: process.env.BLACKBLAZE_BUCKETID,
        });
        const base64Image = file?.split(";base64,");
        const extension = base64Image[0]?.split("/")?.pop();
        const readData = Buffer.from(file?.replace(/^data:image\/\w+;base64,/, ""), "base64");
        const filename = fileName || `${+new Date()}.${extension}`;

        const response = await b2.uploadFile({
          uploadUrl: data.data.uploadUrl,
          uploadAuthToken: data.data.authorizationToken,
          fileName: `${folderName}/${filename}`,
          data: readData,
          contentLength: 1000000000,
        });
        resolve({ fileName: `${process.env.BACKBLAZE_ACCESS_URL}${response.data.fileName}`, fileId: response?.data?.fileId });
      } catch (error: any) {
        reject(error.message);
      }
    });
  }
}
