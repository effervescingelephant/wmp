/// <reference path="DiagramElement.ts" />

interface DiagramNode extends DiagramElement {
    getX(): number;
    getY(): number;
    getImagePath(): string;
    setPosition(x: number, y: number, zoom: number): void;
    getPropertyEditElement(): PropertyEditElement;
    initPropertyEditElements(zoom: number): void;
    setResizingFlags(bbox, x: number, y: number, paddingPercent) : void;
    clearResizingFlags() : void;
    pointermove(evt, x, y) : void;
}