module.exports = {
    apps: [
        {
            name: 'MSS',
            script: 'bin/www',
            watch: true,
            ignore_watch: [
                'node_modules'
            ],
            env: {
                PORT: 8888
            }
        }
    ]
};
