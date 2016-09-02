declare class PluginController {
    public static create(className: string, ...args: any[]);
    public static exec(object: any, method: string, ...args: any[]);
}

declare class UndoRedoController {
    /*
    public addCommand(command: Command);
    public undo(): void;
    public redo(): void;
    public clearStack(): void;
    public bindKeyboardHandler();
    public unbindKeyboardHandler();
    */
}

declare class GesturesController {
    /*
    constructor(paperController: SceneController, paper: DiagramScene);
    public startDrawing(): void;
    public onMouseMove(event): void;
    public onMouseDown(event): void;
    public onMouseUp(event): void;
    */
}
