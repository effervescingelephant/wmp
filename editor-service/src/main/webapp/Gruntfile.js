module.exports = function (grunt) {

    grunt.initConfig({
        ts: {
            shared: {
                src: ["shared/**/*.ts"],
                out: "resources/js/compiled/shared.js"
            },
            editor: {
                src: ["app/editor/diagram/**/*.ts", "app/editor/*.ts"],
                out: "resources/js/compiled/editor.js"
            },
            interpreter: {
                src: ["app/editor/interpreter/**/*.ts"],
                out: "resources/js/compiled/interpreter.js"
            },
            twoDModelRobots: {
                src: ["app/twoDModel/implementations/**/*.ts"],
                out: "resources/js/compiled/two-d-model-robots.js"
            }
        }
    });

    grunt.loadNpmTasks("grunt-ts");
    grunt.registerTask("default", ["ts:shared", "ts:editor", "ts:interpreter", "ts:twoDModelRobots"]);
}
