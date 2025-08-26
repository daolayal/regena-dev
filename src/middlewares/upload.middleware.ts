import multer, { FileFilterCallback } from 'multer';
import { Request, Response, NextFunction } from 'express';
import {config} from "../config/config";


const allowedMimeTypes = [
    'application/zip',
    'application/x-7z-compressed',
    'application/x-rar-compressed',
    'application/x-tar',
    'application/x-zip-compressed',
    'application/gzip',
    'application/x-bzip2',
    'application/x-xz',
];


const fileFilter = (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type'));
    }
};

const maxSize = parseInt(String(config.fileSizeLimitMb));

const upload = multer({
    dest: 'uploads/',
    limits: { fileSize: maxSize * 1024 * 1024 },
    fileFilter,
});



export const uploadSingleFile = (fieldName: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
        const uploadSingle = upload.single(fieldName);

        uploadSingle(req, res, (err: any) => {
            if (err) {
                const statusCode = err instanceof multer.MulterError ? 400 : 500;
                return res.status(statusCode).json({ error: err.message });
            }
            next();
        });
    };
};
