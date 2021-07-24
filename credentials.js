const {exec} = require("child_process");
const readline = require("readline");

const cypressCmd = process.argv.slice(2).join(" ");
console.log("CMD", cypressCmd);
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question("username ", username => {
    rl.question("password ", password => {
        if (~["aix", "darwin", "freebsd", "linux", "openbsd", "sunos"].indexOf(process.platform)) {
            exec(`CYPRESS_username=${username} CYPRESS_password=${password} ${cypressCmd}`);
        } else if (~["win32"].indexOf(process.platform)) {
            exec(`SET CYPRESS_username=${username}&SET CYPRESS_password=${password}&${cypressCmd}`);
        } else {
            throw new Error("Error: Platform not recognised");
        }

        rl.close();
    });
});
