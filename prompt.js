const {exec} = require("child_process");
const prompt = require("prompt");
const cypressCmd = process.argv.slice(2).join(" ");
const schema = {
    properties: {
        username: {
            pattern: /^[a-zA-Z\s\-]+$/,
            message: "Name must be only letters, spaces, or dashes",
            required: true
        },
        password: {
            hidden: true,
            required: true
        }
    }
};
prompt.start();
prompt.message = "";

console.log("cypressCmd", cypressCmd)
prompt.get(schema, function (err, result) {
    if (~["aix", "darwin", "freebsd", "linux", "openbsd", "sunos"].indexOf(process.platform)) {
        exec(`CYPRESS_username=${result.username} CYPRESS_password=${result.password} ${cypressCmd}`);
    } else if (~["win32"].indexOf(process.platform)) {
        exec(`SET CYPRESS_username=${result.username}&SET CYPRESS_password=${result.password}&${cypressCmd}`);
    } else {
        throw new Error("Error: Platform not recognised");
    }
});
