import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';
import replace from '@rollup/plugin-replace';
import dotenv from 'dotenv';

const env = dotenv.config().parsed;
const envKeys = Object.keys(env).reduce((prev, next) => {
  prev[`process.env.${next}`] = JSON.stringify(env[next]);
  return prev;
}, {});

export default defineConfig({
  plugins: [
    react(),
    replace({
      ...envKeys,
    }),
  ],
  resolve: {
    alias: {
      '@components': path.resolve(__dirname, 'src/components'),
      '@styles': path.resolve(__dirname, 'src/styles'),
      '@configs': path.resolve(__dirname, 'src/configs'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@redux': path.resolve(__dirname, 'src/redux'),
      '@layout': path.resolve(__dirname, 'src/layout'),
    },
  }
})
