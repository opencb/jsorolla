import {defineConfig} from "vite";

const env = process.env || {};
const sites = ["iva"];

const getCustomSitePath = (name, folder) => {
    if (env.npm_config_custom_site) {
        return `../../../custom-sites/${env.npm_config_custom_site}/${name}/${folder}`;
    }
    return folder; // Default path configuration
};

const transformHtmlContent = html => {
    sites.forEach(name => {
        const regex = new RegExp(`{{ ${name.toUpperCase()}_CONFIG_PATH }}`, "g");
        html = html.replace(regex, getCustomSitePath(name, "conf"));
    });
    return html;
};

export default defineConfig({
    mode: env.NODE_ENV || "development",
    root: "./",
    server: {
        open: "/src/sites/iva/index.html",
        port: 3000,
        watch: ["src", "styles", "custom-sites"]
    },
    plugins: [
        {
            name: "html-transform",
            transformIndexHtml: transformHtmlContent,
            apply: "serve",
        }
    ],
});
