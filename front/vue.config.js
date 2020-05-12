module.exports = {
    "transpileDependencies": [
        "vuetify"
    ],
    devServer: {
        disableHostCheck: true,
        host: '0.0.0.0',
        port: 8080,
    },
    pwa: {
        appleMobileWebAppCapable: 'yes',
        appleMobileWebAppStatusBarStyle: 'default',
        manifestPath: '/assets/site.webmanifest',
        workboxPluginMode: 'InjectManifest',
        workboxOptions: {
            swSrc: 'sw.js',
            exclude: [/\.map$/, /_redirects/],
        }
    }
}
