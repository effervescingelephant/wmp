class ResizeCommand implements Command {

    private cellView;
    private oldX: number;
    private oldY: number;
    private newX: number;
    private newY: number;
    private direction: string;
    private zoom: number;
    private executionFunction: (cellView, x: number, y: number, lastX: number, lastY: number, direction: string) => void;

    constructor(cellView,  oldX: number, oldY: number, newX: number, newY: number, direction: string, zoom: number,
                executionFunction: (cellView, x: number, y: number) => void) {
        this.cellView = cellView;
        this.oldX = oldX;
        this.oldY = oldY;
        this.newX = newX;
        this.newY = newY;
        this.direction = direction;
        this.zoom = zoom;
        this.executionFunction = executionFunction;
    }

    public execute(): void {
        this.executionFunction(this.cellView, this.newX, this.newY, this.oldX, this.oldY, this.direction);
    }

    public revert(): void {
        this.executionFunction(this.cellView, this.oldX, this.oldY, this.newX, this.newY, this.direction);
    }

    public isRevertible(): boolean {
        return !(this.newX === this.oldX && this.newY === this.oldY);
    }

}/**
 * Created by lara on 22.12.16.
 */