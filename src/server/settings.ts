
const server_settings = {
    mailer: {
        mta: {
            host: 'PUT-SMTP-ADDRESS-HERE',
            port: 25,
            secure: false,
            connectionTimeout: 30000,
            greetingTimeout: 30000,
            socketTimeout: 30000,
        },
        from: 'Resapp <resapp@resapp.com>',
    },
};

export default server_settings;
