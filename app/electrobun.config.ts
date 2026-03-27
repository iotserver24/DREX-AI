import { type ElectrobunConfig } from 'electrobun';

const config: ElectrobunConfig = {
  app: {
    name: 'DREX-AI',
    identifier: 'ai.drex.desktop',
    version: '0.1.0'
  },
  build: {
    bun: {
      entrypoint: 'src/bun/index.ts'
    },
    copy: {
      'src/ui/dist/index.html': 'index.html',
      'src/ui/dist/test.html': 'test.html',
      'src/ui/dist/assets': 'assets'
    }
  }
};

export default config;
