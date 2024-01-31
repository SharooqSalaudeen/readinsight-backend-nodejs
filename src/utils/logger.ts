import { createLogger, format, transports } from 'winston'

import dayjs from 'dayjs'

const logTransports = [
    new transports.File({
        level: 'error',
        filename: `./logs/${dayjs().format(
            'DD-MMM-YYYY'
        )}/Activity-${dayjs().format('hha')}.log`,
        format: format.json({
            replacer: (key, value) => {
                if (key === 'error') {
                    return {
                        message: (value as Error).message,
                        stack: (value as Error).stack,
                    }
                }
                return value
            },
        }),
    }),
    new transports.Console({
        level: 'debug',
        format: format.prettyPrint(),
    }),
    new transports.File({
        level: 'info',
        filename: `./logs/${dayjs().format(
            'DD-MMM-YYYY'
        )}/Activity-${dayjs().format('hha')}.log`,
        format: format.prettyPrint(),
    }),
]

export const logger = createLogger({
    format: format.combine(format.timestamp()),
    transports: logTransports,
    defaultMeta: { service: 'api' },
})
