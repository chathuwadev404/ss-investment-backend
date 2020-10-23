module.exports = {

    APP_NAME: "SMART-PHARMACY-APPLICATION",

    DATABASE: {
        CONNECTION_LIMIT: 100,
        HOST: "localhost",
        USER: "root",
        PASSWORD: "password",
        DB: "pharmacy-db"
    },

    SERVER: {
        PORT: 3000
    },

    PAGINATION: {
        MAX_LIMIT: 100
    },

    UPLOAD_FILES: {
        DIR_PATH: '/uploads',
        DIR_NAME: 'uploads'
    },

    LOGGER: {
        PATH: './logs',
        TIME_FORMAT: 'YYYY-MM-DD HH:mm:ss',
        MAX_FILE_SIZE: '20m',
        MAX_FILES: '14d',
    }
};