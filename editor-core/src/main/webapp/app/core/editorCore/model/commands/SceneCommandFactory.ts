class SceneCommandFactory {

    private sceneController: SceneController;

    constructor(sceneController: SceneController) {
        this.sceneController = sceneController;
    }

    public makeChangeCurrentElementCommand(newElement: DiagramElement, oldElement: DiagramElement): Command {
        return new ChangeCurrentElementCommand(newElement, oldElement,
            this.sceneController.setCurrentElement.bind(this.sceneController));
    }

    public makeCreateNodeCommand(node: DiagramNode): Command {
        return new CreateElementCommand(node, this.sceneController.addNode.bind(this.sceneController),
            this.sceneController.removeElement.bind(this.sceneController));
    }

    public makeCreateLinkCommand(link: Link): Command {
        return new CreateElementCommand(link, this.sceneController.addLink.bind(this.sceneController),
            this.sceneController.removeElement.bind(this.sceneController));
    }

    public makeRemoveNodeCommand(node: DiagramNode): Command {
        return new RemoveElementCommand(node, this.sceneController.removeElement.bind(this.sceneController),
            this.sceneController.addNode.bind(this.sceneController));
    }

    public makeRemoveLinkCommand(link: Link): Command {
        return new RemoveElementCommand(link, this.sceneController.removeElement.bind(this.sceneController),
            this.sceneController.addLink.bind(this.sceneController));
    }

    public makeMoveCommand(node: DiagramNode, cellView, oldX: number, oldY: number, newX: number, newY: number,
                           zoom: number): Command {
        return new MoveCommand(cellView, oldX, oldY, newX, newY, zoom, node.setPosition.bind(node));
    }

    public makeResizeCommand(node: DiagramNode, cellView, oldX: number, oldY: number, newX: number,
                             newY: number, direction: string, zoom: number): Command {
        return new ResizeCommand(cellView, oldX, oldY, newX, newY, direction, zoom, node.setSizeCommand.bind(node));
    }


}