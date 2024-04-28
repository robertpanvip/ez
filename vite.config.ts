import {defineConfig} from 'vite'
import checker from 'vite-plugin-checker'
import ez from 'ez-vite'
//import react from '@vitejs/plugin-react'
// https://vitejs.dev/config/
export default defineConfig({
    plugins: [ez(), checker({typescript: true})],
})
