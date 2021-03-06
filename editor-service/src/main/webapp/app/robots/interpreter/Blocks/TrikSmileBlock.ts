

class TrikSmileBlock extends AbstractBlock {

    private robotModels: RobotModel[];
    private EXPECTED_NUMBER_OF_OUTBOUND_LINKS = 1;

    constructor(node: DiagramNode, outboundLinks: Link[], robotModels: RobotModel[]) {
        super(node, outboundLinks);
        this.robotModels = robotModels;
    }

    public run(): void {
        var output = this.node.getName(); + "\n";
        this.checkExpectedNumberOfOutboundLinks(this.EXPECTED_NUMBER_OF_OUTBOUND_LINKS);

        for (var modelId = 0; modelId < this.robotModels.length; modelId++) {
            var model = this.robotModels[modelId];
            model.getDisplayWidget().drawSmile();
        }

        console.log(output);
    }

    public getNextNodeId(): string {
        return this.outboundLinks[0].getJointObject().get('target').id;
    }

}