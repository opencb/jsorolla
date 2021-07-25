const liveServer = require("live-server");

const params = {
    port: 3000,
    host: "localhost",
    // open: "/src",
    open: "/src/apps/iva",
    // watch: ["src", "lib/jsorolla/src", "lib/jsorolla/styles"],
    watch: ["src", "styles"],
    // ignore: "cypress,report,build,docker",
    // wait: 1000, // Waits for all changes, before reloading. Defaults to 0 sec.
    logLevel: 2
};
liveServer.start(params);

