declare module 'multer-s3' {
  import { S3Client } from '@aws-sdk/client-s3';
  import { StorageEngine } from 'multer';

  interface Options {
    s3: S3Client;
    bucket: string;
    contentType?: any;
    key?: (
      req: Express.Request,
      file: Express.Multer.File,
      cb: (error: any, key?: string) => void
    ) => void;
    acl?: string;
    metadata?: (
      req: Express.Request,
      file: Express.Multer.File,
      cb: (error: any, metadata?: any) => void
    ) => void;
  }

  interface MulterS3 {
    (options: Options): StorageEngine;
    AUTO_CONTENT_TYPE: any;
  }

  const multerS3: MulterS3;
  export default multerS3;
}
