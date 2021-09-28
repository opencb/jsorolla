import {defineConfig} from "vite";

const env = process.env || {};
const sites = ["iva"];

const getSiteConfigPath = name => {
    if (env.npm_config_custom_config) {
        return `../../../custom-conf/${env.npm_config_custom_config}/${name}`;
    }
    return "conf"; // Default path configuration
};

const transformHtmlContent = html => {
    sites.forEach(name => {
        const regex = new RegExp(`{{ ${name.toUpperCase()}_CONFIG_PATH }}`, "g");
        html = html.replace(regex, getSiteConfigPath(name));
    });
    return html;
};

export default defineConfig({
    mode: env.NODE_ENV || "development",
    root: "./",
    server: {
        open: "/src/sites/iva/index.html",
        port: 3000,
        watch: ["src", "styles", "custom-conf"]
    },
    plugins: [
        {
            name: "html-transform",
            transformIndexHtml: transformHtmlContent,
            apply: "serve",
        }
    ],
});
