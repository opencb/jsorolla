

module.exports = function (grunt) {
    grunt.loadNpmTasks("grunt-shell");

    // console.log(grunt.option("studies") || "X0");

    function e2eRunner() {
        const studies = grunt.option("studies") ? grunt.option("studies").split(",") : [];
        const tasks = [];

        for (let i = 0; i < studies.length; i++) {
            tasks.push(["e2e", studies].join(":"));
        }
        grunt.task.run(tasks);

        grunt.log.ok(["Finished."]);
    }

    function shell() {
        const exec = require("child_process").execSync;
        const cmds = `
//echo ${grunt.option("study")} > textfile
rm -rf mochawesome-report/ && \
./credentials.sh npx cypress run --headless --spec 'cypress/integration/002-login.js'; \
mochawesome-merge mochawesome-report/*.json -o mochawesome-report/cypress-combined-report.json && \
marge --reportFilename report.html --charts --timestamp _HH-MM_dd-mm-yyyy --reportPageTitle IVA --reportTitle IVA --reportDir ./report mochawesome-report/cypress-combined-report.json && \
rm -rf 'mochawesome-report/'`
        const result = exec(cmds, {encoding: "utf8"});
        grunt.log.writeln(result);
    }

    function e2e() {
        if (!grunt.option("study")) {
            grunt.option("study", this.args[0] || "NULL");
        }
        grunt.task.run([
            // "launch test"
            // "make report"
        ]);

    }
    grunt.registerTask("e2e_all", e2eRunner);
    grunt.registerTask("e2e", e2e);
    grunt.registerTask("shell", shell);


/*    grunt.initConfig({
        shell: {
            command: [
                "ls"
            ].join("&&")
        }
    });*/
    grunt.registerTask("default", ["shell"]);
};
