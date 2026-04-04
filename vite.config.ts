import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        strategies: 'injectManifest',
        srcDir: 'src',
        filename: 'sw.ts',
        injectManifest: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2,woff}'],
          maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
        },
        manifest: false,
      }),
      {
        name: 'html-supabase-preconnect',
        transformIndexHtml(html) {
          const url = env.VITE_SUPABASE_URL;
          if (!url) return html;
          try {
            const origin = new URL(url).origin;
            return html.replace(
              '</head>',
              `    <link rel="dns-prefetch" href="${origin}" />\n    <link rel="preconnect" href="${origin}" crossorigin />\n</head>`,
            );
          } catch {
            return html;
          }
        },
      },
    ],
  };
});
