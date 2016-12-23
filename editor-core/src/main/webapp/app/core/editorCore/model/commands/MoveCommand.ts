class MoveCommand implements Command {

    private cellView;
    private oldX: number;
    private oldY: number;
    private newX: number;
    private newY: number;
    private zoom: number;
    private executionFunction: (cellView, x: number, y: number, zoom: number) => void;

    constructor(cellView, oldX: number, oldY: number, newX: number, newY: number, zoom: number,
                executionFunction: (x: number, y: number) => void) {
        this.cellView = cellView;
        this.oldX = oldX;
        this.oldY = oldY;
        this.newX = newX;
        this.newY = newY;
        this.zoom = zoom;
        this.executionFunction = executionFunction;
    }

    public execute(): void {
        this.executionFunction(this.cellView, this.newX, this.newY, this.zoom);
    }

    public revert(): void {
        this.executionFunction(this.cellView, this.oldX, this.oldY, this.zoom);
    }

    public isRevertible(): boolean {
        return !(this.newX === this.oldX && this.newY === this.oldY);
    }

}