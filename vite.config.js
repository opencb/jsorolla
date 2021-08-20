
import {defineConfig} from "vite";
import {resolve} from "path";

const __dirname = resolve();
console.log(__dirname);

export default defineConfig({
    root: "./",
    server: {
        open: "/src/sites/iva",
        port: 3000
    }

});
