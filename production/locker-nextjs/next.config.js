module.exports = {
    reactStrictMode: false,
    serverRuntimeConfig: {
        // your domain
        myDomain: 'https://eco.blockchainlock.io',
    },
    experimental: {
        forceSwcTransforms: true
    },
    i18n: {
        locales: ['jp', 'en', 'cn'], // your language list
        defaultLocale: 'jp' // default language
    },
    publicRuntimeConfig: {
        public: './public',
        googleKey:'your_google_key',
        stripePublicKey:'your_stripe_public_key',
        loginApi:'your_verification_code_url'
    },
    transpilePackages: [
        "antd",
        "rc-util",
        "@babel/runtime",
        "@ant-design/icons",
        "@ant-design/icons-svg",
        "rc-pagination",
        "rc-picker",
        "rc-tree",
        "rc-table"
    ],
    async rewrites() {
        return [
            {
                source: "/api/eagle-pms/v1/:path*",
                destination: "https://eco.blockchainlock.io/api/eagle-pms/v1/:path*",
            }
        ]
    }
};


