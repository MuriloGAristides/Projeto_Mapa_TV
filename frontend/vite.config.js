// vite.config.js

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  // ADICIONE ESTA LINHA: 
  // Isso instrui o Vite a prefixar todos os caminhos de assets com /tv2/ 
  base: '/tv2/', 
  plugins: [react()],
})