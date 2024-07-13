import {createLogger, format, transports} from 'winston';
const { combine, timestamp, splat, printf } = format;

const myFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

export const logger = createLogger({
  level: 'info',
  format: combine(
    splat(),
    timestamp(),
    myFormat
  ),
  transports: [new transports.Console()],
});
