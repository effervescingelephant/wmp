declare class PluginController {
    public static create(className: string, ...args: any[]);
    public static exec(object: any, method: string, ...args: any[]);
}

declare class UndoRedoController {
    public addCommand(...args: any[]);
    public undo(): void;
    public redo(): void;
    public clearStack(): void;
    public bindKeyboardHandler();
    public unbindKeyboardHandler();
}