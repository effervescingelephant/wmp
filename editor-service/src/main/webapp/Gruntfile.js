module.exports = function (grunt) {

    grunt.initConfig({
        ts: {
            pluginController: {
                src: ["app/editor/plugins/*.ts"],
                out: "resources/js/compiled/pluginController.js"
            },
            editorCore: {
                src: ["app/editor/core/**/*.ts"],
                out: "resources/js/compiled/editorCore.js"
            },
            twoDModelCore: {
                src: ["app/twoDModel/core/**/*.ts"],
                out: "resources/js/compiled/twoDModelCore.js"
            },
            editor: {
                src: ["app/editor/diagram/**/*.ts"],
                out: "resources/js/compiled/editor.js"
            },
            undoRedoPlugin: {
                src: ["app/editor/plugins/undo-redo/**/*.ts"],
                out: "resources/js/compiled/undoRedoPlugin.js"
            },
            gesturesPlugin: {
                src: ["app/editor/plugins/gestures/**/*.ts"],
                out: "resources/js/compiled/gesturesPlugin.js"
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
    grunt.registerTask("default", ["ts:pluginController", "ts:editorCore", "ts:twoDModelCore", "ts:editor", "ts:undoRedoPlugin", "ts:gesturesPlugin", "ts:interpreter", "ts:twoDModelRobots"]);
}
