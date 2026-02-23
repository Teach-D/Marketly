import { Global, Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

const isProduction = process.env['NODE_ENV'] === 'production';

function buildFormat(): winston.Logform.Format {
  if (isProduction) {
    return winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json(),
    );
  }
  return winston.format.combine(
    winston.format.timestamp({ format: 'HH:mm:ss' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(({ timestamp, level, context, message, ...rest }) => {
      const ctx = context ? `[${String(context)}] ` : '';
      const extra = Object.keys(rest).length ? ` ${JSON.stringify(rest)}` : '';
      return `${String(timestamp)} ${level} ${ctx}${String(message)}${extra}`;
    }),
  );
}

@Global()
@Module({
  imports: [
    WinstonModule.forRoot({
      level: isProduction ? 'info' : 'debug',
      transports: [new winston.transports.Console({ format: buildFormat() })],
    }),
  ],
  exports: [WinstonModule],
})
export class LoggerModule {}
