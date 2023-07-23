const CopyPlugin = require('copy-webpack-plugin');
const path = require('path');
/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config) => {
    config.plugins.push(
      new CopyPlugin({
        patterns: [
          {
            from: 'node_modules/vscode-icons-ts/build/icons',
            to: path.join(__dirname, 'public', 'assets', 'fileicons'),
          },
        ],
      })
    );
    return config;
  },
  reactStrictMode: false,
};

module.exports = nextConfig;
