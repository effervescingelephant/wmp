

class TrikDrawEllipseBlock extends AbstractBlock {

    private interpreter: Interpreter;
    private robotModels: RobotModel[];
    private EXPECTED_NUMBER_OF_OUTBOUND_LINKS = 1;

    constructor(node: DiagramNode, outboundLinks: Link[], interpreter: Interpreter, robotModels: RobotModel[]) {
        super(node, outboundLinks);
        this.interpreter = interpreter;
        this.robotModels = robotModels;
    }

    public run(): void {
        var output = this.node.getName(); + "\n";
        this.checkExpectedNumberOfOutboundLinks(this.EXPECTED_NUMBER_OF_OUTBOUND_LINKS);

        var properties = this.node.getChangeableProperties();
        var parser = new Parser();
        var width = parser.parseExpression(properties["WidthEllipse"].value, this.interpreter);
        var height = parser.parseExpression(properties["HeightEllipse"].value, this.interpreter);
        var x = parser.parseExpression(properties["XCoordinateEllipse"].value, this.interpreter);
        var y = parser.parseExpression(properties["YCoordinateEllipse"].value, this.interpreter);

        for (var modelId = 0; modelId < this.robotModels.length; modelId++) {
            var model = this.robotModels[modelId];
            model.getDisplayWidget().drawEllipse(x, y, width, height,
                this.interpreter.getEnvironmentVariable("painterColor"),
                this.interpreter.getEnvironmentVariable("painterWidth"));
        }

        console.log(output);
    }

    public getNextNodeId(): string {
        return this.outboundLinks[0].getJointObject().get('target').id;
    }

}