import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({plugins:[tailwindcss(),react()],server:{host:'0.0.0.0',port:5173,strictPort:true,watch:{usePolling:true,interval:500},proxy:{'/api':{target:process.env.API_PROXY_TARGET||'http://api:8000',changeOrigin:true}}}});
