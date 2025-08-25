import { createLogger, format, transports } from 'winston';
import path from 'path';
import fs from 'fs';

export function getLogger(filename: string) {
    const logDir = path.join(__dirname, '../logs');
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir);
    }

    return createLogger({
        level: 'info',
        format: format.combine(
            format.timestamp(),
            format.json()
        ),
        transports: [
            new transports.File({ filename: path.join(logDir, filename) })
        ]
    });
}