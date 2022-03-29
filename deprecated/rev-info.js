// const execSync = require("child_process").execSync;
// const packageJson = require("./package.json");
// // const jsorollaPackageJson = require("./lib/jsorolla/package.json");

// try {
//     const ivaBranch = execSync("git rev-parse --abbrev-ref HEAD").toString();
//     const ivaSha1 = execSync("git rev-parse HEAD").toString();
//     const jsorollaBranch = execSync("(cd ./lib/jsorolla; git rev-parse --abbrev-ref HEAD)").toString();
//     const jsorollaSha1 = execSync("(cd ./lib/jsorolla; git rev-parse HEAD)").toString();
//     module.exports = `~
//   ~ IVA Version: ${packageJson.version} | Git: ${ivaBranch.trim()} - ${ivaSha1.trim()}
//   ~ Jsorolla Version: ${jsorollaPackageJson.version} | Git: ${jsorollaBranch.trim()} - ${jsorollaSha1.trim()}
//   ~ Build generated on: ${new Date()}`;
// } catch (error) {
//     console.error(`
//         Status: ${error.status}
//         ${error.stderr.toString()}
//     `);
// }


const execSync = require("child_process").execSync;
const packageJson = require("./package.json");
// const jsorollaPackageJson = require("./lib/jsorolla/package.json");

try {
    const jsorollaBranch = execSync("git rev-parse --abbrev-ref HEAD").toString();
    const jsorollaSha1 = execSync("git rev-parse HEAD").toString();
    module.exports = `~
  ~ Jsorolla Version: ${packageJson.version} | Git: ${jsorollaBranch.trim()} - ${jsorollaSha1.trim()}
  ~ Build generated on: ${new Date()}`;
} catch (error) {
    console.error(`
        Status: ${error.status}
        ${error.stderr.toString()}
    `);
}
