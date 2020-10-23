const {createLogger, format, transports} = require('winston');
require('winston-daily-rotate-file');
const appConfig = require("../../config/app.config");
const {printf} = format;

const loggerFormat = printf(({level, message, timestamp, fileName}) => {
    if (level === 'http') {
        return `[${level.toUpperCase()}] [${timestamp}] : ${message}`;
    }
    return `[${level.toUpperCase()}] [${timestamp}] ${fileName} : ${message}`;
});

const transport = (fileName, level, loggerFormat) => new transports.DailyRotateFile({
    filename: `${appConfig.LOGGER.PATH}/${fileName}-%DATE%.log`,
    datePattern: 'YYYY-MM-DD',
    zippedArchive: true,
    maxSize: appConfig.LOGGER.MAX_FILE_SIZE,
    maxFiles: appConfig.LOGGER.MAX_FILES,
    level: level
});

const logger = function (fileName) {
    return createLogger({
        level: 'verbose',
        json: true,
        maxsize: 5242880, // 5MB
        format: format.combine(
            format.timestamp({
                format: appConfig.LOGGER.TIME_FORMAT
            }),
            loggerFormat
        ),
        defaultMeta: {fileName: fileName},
        transports: [
            new transports.Console({
                level: "verbose",
                format: format.combine(
                    format.colorize()
                )
            }),
            transport("app-error", 'error'),
            transport("app", 'http')
        ]
    });
};

module.exports = logger;

// https://github.com/winstonjs/winston/blob/master/examples/quick-start.js
// https://stackoverflow.com/a/53077705/12925022
