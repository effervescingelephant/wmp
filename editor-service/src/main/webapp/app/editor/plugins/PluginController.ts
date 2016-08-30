class PluginController {
    public static create(className: string, ...args: any[]) {
        return (window.hasOwnProperty(className)) ? new window[className](args) : null;
    }
    public static exec(object: Object, method: string, ...args: any[]) {
        return (object && object.hasOwnProperty(method)) ? object[method](args) : null;
    }
}