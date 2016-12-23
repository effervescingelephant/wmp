/// <reference path="DiagramElement.ts" />

interface DiagramNode extends DiagramElement {
    isResizing(): boolean;
    getResizeDirection(): string;
    getX(): number;
    getY(): number;
    getImagePath(): string;
    setPosition(cellView, x: number, y: number, zoom: number): void;
    setSize(cellView, x: number, y: number, direction: string): void;
    setSizeCommand(cellView, x: number, y: number, lastX: number, lastY: number, direction: string): void;
    getPropertyEditElement(): PropertyEditElement;
    initPropertyEditElements(zoom: number): void;
    setResizingFields(bbox, x: number, y: number, paddingPercent) : void;
    clearResizingFlags() : void;
    pointermove(cellView, evt, x, y) : void;
}