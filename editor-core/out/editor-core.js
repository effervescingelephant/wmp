var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var Property = (function () {
    function Property(name, type, value) {
        this.name = name;
        this.type = type;
        this.value = value;
    }
    return Property;
}());
var PropertiesPack = (function () {
    function PropertiesPack(logical, graphical) {
        this.logical = logical;
        this.graphical = graphical;
    }
    return PropertiesPack;
}());
var Link = (function () {
    function Link(jointObject, properties) {
        var _this = this;
        this.changeableProperties = {};
        this.name = "Link";
        this.type = "ControlFlow";
        this.logicalId = UIDGenerator.generate();
        this.constPropertiesPack = this.getDefaultConstPropertiesPack();
        this.jointObject = jointObject;
        this.changeableProperties = properties;
        this.changeLabel(properties["Guard"].value);
        this.updateHighlight();
        jointObject.on('change:source', function () {
            _this.updateHighlight();
        });
        jointObject.on('change:target', function () {
            _this.updateHighlight();
        });
    }
    Link.prototype.getLogicalId = function () {
        return this.logicalId;
    };
    Link.prototype.getJointObject = function () {
        return this.jointObject;
    };
    Link.prototype.getName = function () {
        return this.name;
    };
    Link.prototype.getType = function () {
        return this.type;
    };
    Link.prototype.getConstPropertiesPack = function () {
        return this.constPropertiesPack;
    };
    Link.prototype.getChangeableProperties = function () {
        return this.changeableProperties;
    };
    Link.prototype.setProperty = function (key, property) {
        this.changeableProperties[key] = property;
        if (key === "Guard") {
            this.changeLabel(property.value);
        }
        var propertyChangedEvent = new CustomEvent('property-changed', {
            detail: {
                nodeId: this.getLogicalId(),
                key: key,
                value: property.value
            }
        });
        document.dispatchEvent(propertyChangedEvent);
    };
    Link.prototype.changeLabel = function (value) {
        this.jointObject.label(0, {
            position: 0.5,
            attrs: {
                text: {
                    text: value, 'font-size': 14
                }
            }
        });
    };
    Link.prototype.getDefaultConstPropertiesPack = function () {
        var logical = this.initConstLogicalProperties();
        var graphical = this.initConstGraphicalProperties();
        return new PropertiesPack(logical, graphical);
    };
    Link.prototype.initConstLogicalProperties = function () {
        var logical = {};
        logical["name"] = new Property("name", "QString", this.name);
        logical["linkShape"] = new Property("linkShape", "int", "-1");
        logical["outgoingExplosion"] = new Property("outgoingExplosion", "qReal::Id", "qrm:/");
        return logical;
    };
    Link.prototype.initConstGraphicalProperties = function () {
        var graphical = {};
        graphical["name"] = new Property("name", "QString", this.name);
        graphical["configuration"] = new Property("configuration", "QPolygon", "0, 0 : 0, 0 : ");
        graphical["fromPort"] = new Property("fromPort", "double", "0");
        graphical["toPort"] = new Property("toPort", "double", "0");
        graphical["position"] = new Property("position", "QPointF", "0, 0");
        return graphical;
    };
    Link.prototype.updateHighlight = function () {
        if (!this.jointObject.get('target').id || !this.jointObject.get('source').id) {
            this.jointObject.attr({
                '.connection': { stroke: 'red' },
                '.marker-target': { fill: 'red', d: 'M 10 0 L 0 5 L 10 10 z' }
            });
        }
        else {
            this.jointObject.attr({
                '.connection': { stroke: 'black' },
                '.marker-target': { fill: 'black', d: 'M 10 0 L 0 5 L 10 10 z' }
            });
        }
    };
    return Link;
}());
var DiagramElementListener = (function () {
    function DiagramElementListener() {
    }
    DiagramElementListener.pointerdown = function (evt, x, y) {
        if (evt.target.getAttribute('magnet') &&
            this.paper.options.validateMagnet.call(this.paper, this, evt.target)) {
            this.model.trigger('batch:start');
            var link = this.paper.getDefaultLink(this, evt.target);
            if (evt.target.tagName === "circle") {
                link.set({
                    source: {
                        id: this.model.id
                    },
                    target: { x: x, y: y }
                });
            }
            else {
                link.set({
                    source: {
                        id: this.model.id,
                        selector: this.getSelector(evt.target),
                        port: $(evt.target).attr('port')
                    },
                    target: { x: x, y: y }
                });
            }
            var typeProperties = DiagramElementListener.getNodeProperties("ControlFlow");
            var nodeProperties = {};
            for (var property in typeProperties) {
                nodeProperties[property] = new Property(typeProperties[property].name, typeProperties[property].type, typeProperties[property].value);
            }
            var linkObject = new Link(link, nodeProperties);
            DiagramElementListener.makeAndExecuteCreateLinkCommand(linkObject);
            this.paper.model.addCell(link);
            this._linkView = this.paper.findViewByModel(link);
            this._linkView.startArrowheadMove('target');
        }
        else {
            this._dx = x;
            this._dy = y;
            joint.dia.CellView.prototype.pointerdown.apply(this, arguments);
        }
    };
    DiagramElementListener.getNodeProperties = function (type) {
        console.error("DiagramElementListener getNodeProperties method is empty");
        return null;
    };
    DiagramElementListener.makeAndExecuteCreateLinkCommand = function (linkObject) {
        console.error("DiagramElementListener makeAndExecuteCreateLinkCommand method is empty");
    };
    return DiagramElementListener;
}());
var DiagramScene = (function (_super) {
    __extends(DiagramScene, _super);
    function DiagramScene(id, graph) {
        var htmlId = id;
        var gridSize = 25;
        var zoomAttr = parseFloat($("#" + htmlId).attr("zoom"));
        _super.call(this, {
            el: $('#' + htmlId),
            width: 2000,
            height: 2000,
            model: graph,
            gridSize: gridSize,
            defaultLink: new joint.dia.Link({
                attrs: {
                    '.connection': { stroke: 'black' },
                    '.marker-target': { fill: 'black', d: 'M 10 0 L 0 5 L 10 10 z' }
                }
            }),
            validateConnection: function (cellViewS, magnetS, cellViewT, magnetT, end, linkView) {
                return (!(magnetT && magnetT.getAttribute('type') === 'output')
                    && !(cellViewT && cellViewT.model.get('type') === 'link'));
            },
            validateMagnet: function (cellView, magnet) {
                return magnet.getAttribute('magnet') !== 'passive';
            },
            diagramElementView: joint.dia.ElementView.extend(jQuery.extend(joint.shapes.basic.PortsViewInterface, {
                pointerdown: DiagramElementListener.pointerdown
            }))
        });
        this.htmlId = htmlId;
        this.gridSize = gridSize;
        this.zoom = (zoomAttr) ? zoomAttr : 1;
        this.graph = graph;
        this.nodesMap = {};
        this.linksMap = {};
        this.scale(this.zoom, this.zoom);
    }
    DiagramScene.prototype.getId = function () {
        return this.htmlId;
    };
    DiagramScene.prototype.getGridSize = function () {
        return this.gridSize;
    };
    DiagramScene.prototype.getZoom = function () {
        return this.zoom;
    };
    DiagramScene.prototype.getNodesMap = function () {
        return this.nodesMap;
    };
    DiagramScene.prototype.getLinksMap = function () {
        return this.linksMap;
    };
    DiagramScene.prototype.getNodeById = function (id) {
        return this.nodesMap[id];
    };
    DiagramScene.prototype.getLinkById = function (id) {
        return this.linksMap[id];
    };
    DiagramScene.prototype.addNodesFromMap = function (nodesMap) {
        $.extend(this.nodesMap, nodesMap);
        for (var nodeId in nodesMap) {
            var node = nodesMap[nodeId];
            if (node instanceof SubprogramNode) {
                this.addSubprogramNode(node);
            }
            else {
                this.addNode(node);
            }
        }
    };
    DiagramScene.prototype.addLinksFromMap = function (linksMap) {
        $.extend(this.linksMap, linksMap);
        for (var linkId in linksMap) {
            var link = linksMap[linkId];
            this.addLink(link);
        }
    };
    DiagramScene.prototype.addLinkToMap = function (link) {
        this.linksMap[link.getJointObject().id] = link;
    };
    DiagramScene.prototype.addLinkToPaper = function (link) {
        this.addLink(link);
        this.addLinkToMap(link);
    };
    DiagramScene.prototype.removeNode = function (nodeId) {
        var _this = this;
        var node = this.nodesMap[nodeId];
        var links = this.graph.getConnectedLinks(node.getJointObject(), { inbound: true, outbound: true });
        links.forEach(function (link) {
            delete _this.linksMap[link.id];
        });
        node.getJointObject().remove();
        if (node.getPropertyEditElement()) {
            node.getPropertyEditElement().getHtmlElement().remove();
        }
        delete this.nodesMap[nodeId];
    };
    DiagramScene.prototype.getConnectedLinkObjects = function (node) {
        var _this = this;
        var links = this.graph.getConnectedLinks(node.getJointObject(), { inbound: true, outbound: true });
        var linkObjects = [];
        links.forEach(function (link) { return linkObjects.push(_this.linksMap[link.id]); });
        return linkObjects;
    };
    DiagramScene.prototype.removeLink = function (linkId) {
        var link = this.linksMap[linkId];
        link.getJointObject().remove();
        delete this.linksMap[linkId];
    };
    DiagramScene.prototype.clear = function () {
        for (var node in this.nodesMap) {
            this.removeNode(node);
        }
        this.linksMap = {};
    };
    DiagramScene.prototype.addSubprogramNode = function (node) {
        var textObject = node.getTextObject();
        node.getJointObject().embed(textObject);
        this.graph.addCell(textObject);
        this.addNode(node);
    };
    DiagramScene.prototype.addNode = function (node) {
        this.nodesMap[node.getJointObject().id] = node;
        this.graph.addCell(node.getJointObject());
        node.initPropertyEditElements(this.zoom);
        if (node.getPropertyEditElement()) {
            node.getPropertyEditElement().getHtmlElement().insertBefore("#" + this.getId());
        }
    };
    DiagramScene.prototype.addLink = function (link) {
        this.graph.addCell(link.getJointObject());
    };
    return DiagramScene;
}(joint.dia.Paper));
var NodeType = (function () {
    function NodeType(name, propertiesMap, image) {
        this.name = name;
        this.propertiesMap = propertiesMap;
        this.image = (image) ? image : null;
    }
    NodeType.prototype.getName = function () {
        return this.name;
    };
    NodeType.prototype.getPropertiesMap = function () {
        return this.propertiesMap;
    };
    NodeType.prototype.getImage = function () {
        return this.image;
    };
    return NodeType;
}());
var PaletteTypes = (function () {
    function PaletteTypes() {
        this.categories = {};
    }
    return PaletteTypes;
}());
var PropertyEditElement = (function () {
    function PropertyEditElement(logicalId, jointObjectId, properties) {
        var propertiesHtml = "";
        for (var propertyKey in properties) {
            var property = properties[propertyKey];
            if (property.type === "string") {
                propertiesHtml += StringUtils.format(PropertyEditElement.propertyTemplate, propertyKey + "-" + logicalId, jointObjectId, propertyKey, property.name, property.value);
                break;
            }
        }
        this.htmlElement = $(StringUtils.format(PropertyEditElement.template, propertiesHtml));
        this.initInputSize();
        this.initInputAutosize();
    }
    PropertyEditElement.prototype.getHtmlElement = function () {
        return this.htmlElement;
    };
    PropertyEditElement.prototype.setPosition = function (x, y) {
        this.htmlElement.css({ left: x - 25, top: y + 55 });
    };
    PropertyEditElement.prototype.initInputSize = function () {
        this.htmlElement.find('input').each(function (index) {
            $(this).css("width", StringUtils.getInputStringSize(this));
        });
    };
    PropertyEditElement.prototype.initInputAutosize = function () {
        this.htmlElement.find('input').on('input', function (event) {
            $(this).trigger('autosize');
        });
        this.htmlElement.find('input').on('autosize', function (event) {
            $(this).css("width", StringUtils.getInputStringSize(this));
        });
    };
    PropertyEditElement.propertyTemplate = "" +
        "<span>{3}:</span> " +
        "<input class='{0} property-edit-input' data-id='{1}' data-type='{2}' " +
        "style='border: dashed 1px; padding-left: 2px; margin-bottom: 1px' value='{4}'>" +
        "<br>";
    PropertyEditElement.template = "" +
        "<div class='property-edit-element' style='position: absolute; text-align: left; z-index: 1;'>" +
        "   {0}" +
        "</div>";
    return PropertyEditElement;
}());
var DefaultDiagramNode = (function () {
    function DefaultDiagramNode(name, type, x, y, properties, imagePath, id, notDefaultConstProperties) {
        this.logicalId = UIDGenerator.generate();
        this.name = name;
        this.type = type;
        this.constPropertiesPack = this.getDefaultConstPropertiesPack(name);
        if (notDefaultConstProperties) {
            $.extend(this.constPropertiesPack.logical, notDefaultConstProperties.logical);
            $.extend(this.constPropertiesPack.graphical, notDefaultConstProperties.graphical);
        }
        var jointObjectAttributes = {
            position: { x: x, y: y },
            size: { width: 50, height: 50 },
            outPorts: [''],
            attrs: {
                image: {
                    'xlink:href': imagePath
                },
            }
        };
        if (id) {
            jQuery.extend(jointObjectAttributes, { id: id });
        }
        this.jointObject = new joint.shapes.devs.ImageWithPorts(jointObjectAttributes);
        this.changeableProperties = properties;
        this.imagePath = imagePath;
    }
    DefaultDiagramNode.prototype.initPropertyEditElements = function (zoom) {
        var _this = this;
        var parentPosition = this.getJointObjectPagePosition(zoom);
        this.propertyEditElement = new PropertyEditElement(this.logicalId, this.jointObject.id, this.changeableProperties);
        this.propertyEditElement.setPosition(parentPosition.x, parentPosition.y);
        this.jointObject.on('change:position', function () {
            var position = _this.getJointObjectPagePosition(zoom);
            _this.propertyEditElement.setPosition(position.x, position.y);
        });
    };
    DefaultDiagramNode.prototype.getPropertyEditElement = function () {
        return this.propertyEditElement;
    };
    DefaultDiagramNode.prototype.getLogicalId = function () {
        return this.logicalId;
    };
    DefaultDiagramNode.prototype.getName = function () {
        return this.name;
    };
    DefaultDiagramNode.prototype.getType = function () {
        return this.type;
    };
    DefaultDiagramNode.prototype.getX = function () {
        return (this.jointObject.get("position"))['x'];
    };
    DefaultDiagramNode.prototype.getY = function () {
        return (this.jointObject.get("position"))['y'];
    };
    DefaultDiagramNode.prototype.setPosition = function (x, y, zoom) {
        this.jointObject.position(x, y);
        var position = this.getJointObjectPagePosition(zoom);
        this.propertyEditElement.setPosition(position.x, position.y);
    };
    DefaultDiagramNode.prototype.getImagePath = function () {
        return this.imagePath;
    };
    DefaultDiagramNode.prototype.getJointObject = function () {
        return this.jointObject;
    };
    DefaultDiagramNode.prototype.getConstPropertiesPack = function () {
        return this.constPropertiesPack;
    };
    DefaultDiagramNode.prototype.setProperty = function (key, property) {
        this.changeableProperties[key] = property;
        var propertyChangedEvent = new CustomEvent('property-changed', {
            detail: {
                nodeId: this.getLogicalId(),
                key: key,
                value: property.value
            }
        });
        document.dispatchEvent(propertyChangedEvent);
    };
    DefaultDiagramNode.prototype.getChangeableProperties = function () {
        return this.changeableProperties;
    };
    DefaultDiagramNode.prototype.getDefaultConstPropertiesPack = function (name) {
        var logical = this.initConstLogicalProperties(name);
        var graphical = this.initConstGraphicalProperties(name);
        return new PropertiesPack(logical, graphical);
    };
    DefaultDiagramNode.prototype.initConstLogicalProperties = function (name) {
        var logical = {};
        logical["name"] = new Property("name", "QString", name);
        logical["from"] = new Property("from", "qReal::Id", "qrm:/ROOT_ID/ROOT_ID/ROOT_ID/ROOT_ID");
        logical["linkShape"] = new Property("linkShape", "int", "0");
        logical["outgoingExplosion"] = new Property("outgoingExplosion", "qReal::Id", "qrm:/");
        logical["to"] = new Property("to", "qReal::Id", "qrm:/ROOT_ID/ROOT_ID/ROOT_ID/ROOT_ID");
        return logical;
    };
    DefaultDiagramNode.prototype.initConstGraphicalProperties = function (name) {
        var graphical = {};
        graphical["name"] = new Property("name", "QString", name);
        graphical["to"] = new Property("to", "qreal::Id", "qrm:/ROOT_ID/ROOT_ID/ROOT_ID/ROOT_ID");
        graphical["configuration"] = new Property("configuration", "QPolygon", "0, 0 : 50, 0 : 50, 50 : 0, 50 : ");
        graphical["fromPort"] = new Property("fromPort", "double", "0");
        graphical["toPort"] = new Property("toPort", "double", "0");
        graphical["from"] = new Property("from", "qReal::Id", "qrm:/ROOT_ID/ROOT_ID/ROOT_ID/ROOT_ID");
        return graphical;
    };
    DefaultDiagramNode.prototype.getJointObjectPagePosition = function (zoom) {
        return {
            x: this.jointObject.get("position")['x'] * zoom,
            y: this.jointObject.get("position")['y'] * zoom
        };
    };
    return DefaultDiagramNode;
}());
var SceneCommandFactory = (function () {
    function SceneCommandFactory(sceneController) {
        this.sceneController = sceneController;
    }
    SceneCommandFactory.prototype.makeChangeCurrentElementCommand = function (newElement, oldElement) {
        return new ChangeCurrentElementCommand(newElement, oldElement, this.sceneController.setCurrentElement.bind(this.sceneController));
    };
    SceneCommandFactory.prototype.makeCreateNodeCommand = function (node) {
        return new CreateElementCommand(node, this.sceneController.addNode.bind(this.sceneController), this.sceneController.removeElement.bind(this.sceneController));
    };
    SceneCommandFactory.prototype.makeCreateLinkCommand = function (link) {
        return new CreateElementCommand(link, this.sceneController.addLink.bind(this.sceneController), this.sceneController.removeElement.bind(this.sceneController));
    };
    SceneCommandFactory.prototype.makeRemoveNodeCommand = function (node) {
        return new RemoveElementCommand(node, this.sceneController.removeElement.bind(this.sceneController), this.sceneController.addNode.bind(this.sceneController));
    };
    SceneCommandFactory.prototype.makeRemoveLinkCommand = function (link) {
        return new RemoveElementCommand(link, this.sceneController.removeElement.bind(this.sceneController), this.sceneController.addLink.bind(this.sceneController));
    };
    SceneCommandFactory.prototype.makeMoveCommand = function (node, oldX, oldY, newX, newY, zoom) {
        return new MoveCommand(oldX, oldY, newX, newY, zoom, node.setPosition.bind(node));
    };
    return SceneCommandFactory;
}());
var SceneController = (function () {
    function SceneController(diagramEditorController, paper) {
        var _this = this;
        this.contextMenuId = "scene-context-menu";
        this.diagramEditorController = diagramEditorController;
        this.undoRedoController = diagramEditorController.getUndoRedoController();
        this.scene = paper;
        this.paperCommandFactory = new SceneCommandFactory(this);
        this.clickFlag = false;
        this.rightClickFlag = false;
        this.lastCellMouseDownPosition = { x: 0, y: 0 };
        this.scene.on('cell:pointerdown', function (cellView, event, x, y) {
            _this.cellPointerdownListener(cellView, event, x, y);
        });
        this.scene.on('blank:pointerdown', function (event, x, y) {
            _this.blankPoinerdownListener(event, x, y);
        });
        this.scene.on('cell:pointerup', function (cellView, event, x, y) {
            _this.cellPointerupListener(cellView, event, x, y);
        });
        this.scene.on('cell:pointermove', function (cellView, event, x, y) {
            _this.cellPointermoveListener(cellView, event, x, y);
        });
        this.diagramEditorController.getGraph().on('change:position', function (cell) {
            if (!_this.rightClickFlag) {
                return;
            }
            cell.set('position', cell.previous('position'));
        });
        this.initDropPaletteElementListener();
        this.initDeleteListener();
        this.initCustomContextMenu();
        this.initPropertyEditorListener();
        DiagramElementListener.makeAndExecuteCreateLinkCommand = function (linkObject) {
            _this.makeAndExecuteCreateLinkCommand(linkObject);
        };
    }
    SceneController.prototype.getCurrentElement = function () {
        return this.currentElement;
    };
    SceneController.prototype.clearState = function () {
        this.currentElement = null;
        this.clickFlag = false;
        this.rightClickFlag = false;
        this.lastCellMouseDownPosition = { x: 0, y: 0 };
    };
    SceneController.prototype.createLink = function (sourceId, targetId) {
        var link = new joint.dia.Link({
            attrs: {
                '.connection': { stroke: 'black' },
                '.marker-target': { fill: 'black', d: 'M 10 0 L 0 5 L 10 10 z' }
            },
            source: { id: sourceId },
            target: { id: targetId },
        });
        var typeProperties = this.diagramEditorController.getNodeProperties("ControlFlow");
        var linkProperties = {};
        for (var property in typeProperties) {
            linkProperties[property] = new Property(typeProperties[property].name, typeProperties[property].type, typeProperties[property].value);
        }
        var linkObject = new Link(link, linkProperties);
        this.makeAndExecuteCreateLinkCommand(linkObject);
    };
    SceneController.prototype.createNode = function (type, x, y, subprogramId, subprogramName) {
        var image = this.diagramEditorController.getNodeType(type).getImage();
        var name = this.diagramEditorController.getNodeType(type).getName();
        var typeProperties = this.diagramEditorController.getNodeType(type).getPropertiesMap();
        var nodeProperties = {};
        for (var property in typeProperties) {
            nodeProperties[property] = new Property(typeProperties[property].name, typeProperties[property].type, typeProperties[property].value);
        }
        var node;
        if (subprogramId) {
            node = new SubprogramNode(subprogramName, type, x, y, nodeProperties, image, subprogramId);
        }
        else {
            node = new DefaultDiagramNode(name, type, x, y, nodeProperties, image);
        }
        var command = new MultiCommand([this.paperCommandFactory.makeCreateNodeCommand(node),
            this.paperCommandFactory.makeChangeCurrentElementCommand(node, this.currentElement)]);
        this.undoRedoController.addCommand(command);
        command.execute();
    };
    SceneController.prototype.createNodeInEventPositionFromNames = function (names, event) {
        var _this = this;
        var offsetX = (event.pageX - $("#" + this.scene.getId()).offset().left +
            $("#" + this.scene.getId()).scrollLeft()) / this.scene.getZoom();
        var offsetY = (event.pageY - $("#" + this.scene.getId()).offset().top +
            $("#" + this.scene.getId()).scrollTop()) / this.scene.getZoom();
        var gridSize = this.scene.getGridSize();
        offsetX -= offsetX % gridSize;
        offsetY -= offsetY % gridSize;
        var filteredNames = names.filter(function (type) {
            return _this.diagramEditorController.getNodeType(type) !== undefined;
        });
        if (filteredNames.length === 0) {
            return;
        }
        if (filteredNames.length === 1) {
            this.createNode(filteredNames[0], offsetX, offsetY);
            return;
        }
        var items = [];
        for (var i = 0; i < filteredNames.length; ++i) {
            items.push({
                "name": filteredNames[i],
                "action": (function (type, offsetX, offsetY) { _this.createNode(type, offsetX, offsetY); })
                    .bind(this, filteredNames[i], offsetX, offsetY)
            });
        }
        var contextMenu = new ContextMenu();
        var menuDiv = document.createElement("div");
        menuDiv.className = "gestures-menu";
        menuDiv.style.left = event.x + "px";
        menuDiv.style.top = event.y + "px";
        document.body.appendChild(menuDiv);
        contextMenu.showMenu(new CustomEvent("context-menu"), menuDiv, items);
    };
    SceneController.prototype.createLinkBetweenCurrentAndEventTargetElements = function (event) {
        var _this = this;
        var diagramPaper = document.getElementById(this.scene.getId());
        var elementBelow = this.diagramEditorController.getGraph().get('cells').find(function (cell) {
            if (cell instanceof joint.dia.Link)
                return false;
            if (cell.id === _this.currentElement.getJointObject().id)
                return false;
            var mXBegin = cell.getBBox().origin().x;
            var mYBegin = cell.getBBox().origin().y;
            var mXEnd = cell.getBBox().corner().x;
            var mYEnd = cell.getBBox().corner().y;
            var leftElementPos = (event.pageX - $(diagramPaper).offset().left + $(diagramPaper).scrollLeft()) /
                _this.scene.getZoom();
            var topElementPos = (event.pageY - $(diagramPaper).offset().top + $(diagramPaper).scrollTop()) /
                _this.scene.getZoom();
            return ((mXBegin <= leftElementPos) && (mXEnd >= leftElementPos)
                && (mYBegin <= topElementPos) && (mYEnd >= topElementPos) && (_this.rightClickFlag));
        });
        if (elementBelow) {
            this.createLink(this.currentElement.getJointObject().id, elementBelow.id);
        }
    };
    SceneController.prototype.changeCurrentElement = function (element) {
        if (element !== this.currentElement) {
            var changeCurrentElementCommand = this.paperCommandFactory.makeChangeCurrentElementCommand(element, this.currentElement);
            this.undoRedoController.addCommand(changeCurrentElementCommand);
            changeCurrentElementCommand.execute();
        }
    };
    SceneController.prototype.makeAndExecuteCreateLinkCommand = function (link) {
        var createLinkCommand = this.paperCommandFactory.makeCreateLinkCommand(link);
        this.undoRedoController.addCommand(createLinkCommand);
        createLinkCommand.execute();
    };
    SceneController.prototype.setCurrentElement = function (element) {
        if (this.currentElement) {
            this.unselectElement(this.currentElement.getJointObject());
        }
        this.currentElement = element;
        if (element) {
            this.selectElement(this.currentElement.getJointObject());
            this.diagramEditorController.setNodeProperties(element);
        }
        else {
            this.diagramEditorController.clearNodeProperties();
        }
    };
    SceneController.prototype.addNode = function (node) {
        if (node instanceof SubprogramNode) {
            this.scene.addSubprogramNode(node);
        }
        else {
            this.scene.addNode(node);
        }
    };
    SceneController.prototype.removeElement = function (element) {
        if (element) {
            if (element instanceof DefaultDiagramNode) {
                this.scene.removeNode(element.getJointObject().id);
            }
            else {
                this.scene.removeLink(element.getJointObject().id);
            }
            if (this.currentElement && element === this.currentElement) {
                this.diagramEditorController.clearNodeProperties();
                this.currentElement = null;
            }
        }
    };
    SceneController.prototype.addLink = function (link) {
        this.scene.addLinkToPaper(link);
    };
    SceneController.prototype.blankPoinerdownListener = function (event, x, y) {
        this.changeCurrentElement(null);
    };
    SceneController.prototype.cellPointerdownListener = function (cellView, event, x, y) {
        this.clickFlag = true;
        this.rightClickFlag = false;
        var element = this.scene.getNodeById(cellView.model.id) ||
            this.scene.getLinkById(cellView.model.id);
        this.changeCurrentElement(element);
        if (this.scene.getNodeById(cellView.model.id)) {
            if (event.button == 1) {
                var node = this.scene.getNodeById(cellView.model.id);
                this.lastCellMouseDownPosition.x = node.getX();
                this.lastCellMouseDownPosition.y = node.getY();
            }
        }
    };
    SceneController.prototype.cellPointerupListener = function (cellView, event, x, y) {
        if ((this.clickFlag) && (event.button == 2)) {
            $("#" + this.contextMenuId).finish().toggle(100).
                css({
                left: event.pageX - $(document).scrollLeft() + "px",
                top: event.pageY - $(document).scrollTop() + "px"
            });
        }
        else if (event.button !== 2) {
            var node = this.scene.getNodeById(cellView.model.id);
            if (node) {
                var command = this.paperCommandFactory.makeMoveCommand(node, this.lastCellMouseDownPosition.x, this.lastCellMouseDownPosition.y, node.getX(), node.getY(), this.scene.getZoom());
                this.undoRedoController.addCommand(command);
            }
        }
    };
    SceneController.prototype.cellPointermoveListener = function (cellView, event, x, y) {
        this.clickFlag = false;
    };
    SceneController.prototype.initDropPaletteElementListener = function () {
        var controller = this;
        var paper = this.scene;
        $("#" + this.scene.getId()).droppable({
            drop: function (event, ui) {
                var topElementPos = (ui.offset.top - $(this).offset().top + $(this).scrollTop()) /
                    paper.getZoom();
                var leftElementPos = (ui.offset.left - $(this).offset().left + $(this).scrollLeft()) /
                    paper.getZoom();
                var gridSize = paper.getGridSize();
                topElementPos -= topElementPos % gridSize;
                leftElementPos -= leftElementPos % gridSize;
                var type = $(ui.draggable.context).data("type");
                controller.createNode(type, leftElementPos, topElementPos, $(ui.draggable.context).data("id"), $(ui.draggable.context).data("name"));
            }
        });
    };
    SceneController.prototype.selectElement = function (jointObject) {
        var jQueryEl = this.scene.findViewByModel(jointObject).$el;
        var oldClasses = jQueryEl.attr('class');
        jQueryEl.attr('class', oldClasses + ' selected');
    };
    SceneController.prototype.unselectElement = function (jointObject) {
        $('input:text').blur();
        var jQueryEl = this.scene.findViewByModel(jointObject).$el;
        var removedClass = jQueryEl.attr('class').replace(new RegExp('(\\s|^)selected(\\s|$)', 'g'), '$2');
        jQueryEl.attr('class', removedClass);
    };
    SceneController.prototype.initCustomContextMenu = function () {
        var controller = this;
        $("#diagram-area").bind("contextmenu", function (event) {
            event.preventDefault();
        });
        $("#" + controller.contextMenuId + " li").click(function () {
            switch ($(this).attr("data-action")) {
                case "delete":
                    controller.removeCurrentElement();
                    break;
            }
            $("#" + controller.contextMenuId).hide(100);
        });
    };
    SceneController.prototype.initDeleteListener = function () {
        var _this = this;
        var deleteKey = 46;
        $('html').keyup(function (event) {
            if (event.keyCode == deleteKey) {
                if ($("#" + _this.scene.getId()).is(":visible") && !(document.activeElement.tagName === "INPUT")) {
                    _this.removeCurrentElement();
                }
            }
        });
    };
    SceneController.prototype.removeCurrentElement = function () {
        var _this = this;
        var removeCommands = [];
        removeCommands.push(this.paperCommandFactory.makeChangeCurrentElementCommand(null, this.currentElement));
        if (this.currentElement instanceof DefaultDiagramNode) {
            var node = this.currentElement;
            var connectedLinks = this.scene.getConnectedLinkObjects(node);
            connectedLinks.forEach(function (link) { return removeCommands.push(_this.paperCommandFactory.makeRemoveLinkCommand(link)); });
            removeCommands.push(this.paperCommandFactory.makeRemoveNodeCommand(node));
        }
        else if (this.currentElement instanceof Link) {
            removeCommands.push(this.paperCommandFactory.makeRemoveLinkCommand(this.currentElement));
        }
        var multiCommand = new MultiCommand(removeCommands);
        this.undoRedoController.addCommand(multiCommand);
        multiCommand.execute();
    };
    SceneController.prototype.initPropertyEditorListener = function () {
        var controller = this;
        $(document).on('focus', ".property-edit-element input", function () {
            controller.changeCurrentElement(controller.scene.getNodeById($(this).data("id")));
        });
    };
    return SceneController;
}());
var HtmlView = (function () {
    function HtmlView() {
        this.content = "";
    }
    HtmlView.prototype.getContent = function () {
        return this.content;
    };
    return HtmlView;
}());
var StringUtils = (function () {
    function StringUtils() {
    }
    StringUtils.format = function (str) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        return str.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] != 'undefined' ? args[number] : match;
        });
    };
    StringUtils.getInputStringSize = function (input) {
        var minWidth = 6;
        var $body = $('body');
        var $this = $(input);
        var $text = $this.text();
        if ($text == '')
            $text = $this.val();
        var calc = '<div style="clear:both;display:block;visibility:hidden;">' +
            '<span style="width;inherit;margin:0;font-family:' + $this.css('font-family') + ';font-size:' +
            $this.css('font-size') + ';font-weight:' + $this.css('font-weight') + '">' + $text + '</span>' +
            '</div>';
        $body.append(calc);
        var width = $('body').find('span:last').width();
        $body.find('span:last').parent().remove();
        return width + minWidth;
    };
    return StringUtils;
}());
var StringPropertyView = (function (_super) {
    __extends(StringPropertyView, _super);
    function StringPropertyView(nodeId, propertyKey, property) {
        _super.call(this);
        this.template = '' +
            '<tr class="property">' +
            '   <td class="vert-align">{0}</td>' +
            '   <td class="vert-align">' +
            '       <div class="input-group">' +
            '           <input class="{1} property-edit-input form-control" type="text" data-type="{2}" value="{3}">' +
            '       </div>' +
            '   </td>' +
            '</tr>';
        this.content = StringUtils.format(this.template, property.name, propertyKey + "-" + nodeId, propertyKey, property.value);
    }
    return StringPropertyView;
}(HtmlView));
var Variant = (function () {
    function Variant(key, value) {
        this.key = key;
        this.value = value;
    }
    Variant.prototype.getKey = function () {
        return this.key;
    };
    Variant.prototype.getValue = function () {
        return this.value;
    };
    return Variant;
}());
var VariantListMapper = (function () {
    function VariantListMapper() {
    }
    VariantListMapper.addVariantList = function (typeName, propertyKey, variants) {
        if (!this.variantsMap[typeName]) {
            this.variantsMap[typeName] = {};
        }
        this.variantsMap[typeName][propertyKey] = variants;
    };
    VariantListMapper.getVariantList = function (typeName, propertyKey) {
        return this.variantsMap[typeName][propertyKey];
    };
    VariantListMapper.variantsMap = {};
    return VariantListMapper;
}());
var CheckboxPropertyView = (function (_super) {
    __extends(CheckboxPropertyView, _super);
    function CheckboxPropertyView(typeName, propertyKey, property) {
        _super.call(this);
        this.template = '' +
            '<tr class="property">' +
            '   <td class="vert-align">{0}</td>' +
            '   <td class="vert-align">' +
            '       <div id="{1}" class="checkbox" data-type="{2}" data-true="{3}" data-false="{4}">' +
            '           <label class="active"><input type="checkbox" {5}>{6}</label>' +
            '       </div>' +
            '   </td>' +
            '</tr>';
        var variantsList = VariantListMapper.getVariantList(typeName, propertyKey);
        var dataTrue;
        var dataFalse;
        for (var i = 0; i < variantsList.length; i++) {
            if (variantsList[i].getKey() === "true") {
                dataTrue = variantsList[i].getValue();
            }
            if (variantsList[i].getKey() === "false") {
                dataFalse = variantsList[i].getValue();
            }
        }
        var visibleValue;
        if (property.value === variantsList[0].getKey()) {
            visibleValue = variantsList[0].getValue();
        }
        else {
            visibleValue = variantsList[1].getValue();
        }
        var state = "";
        if (property.value === "true") {
            state = "checked";
        }
        this.content = StringUtils.format(this.template, property.name, propertyKey + "Property", propertyKey, dataTrue, dataFalse, state, visibleValue);
    }
    return CheckboxPropertyView;
}(HtmlView));
var DropdownPropertyView = (function (_super) {
    __extends(DropdownPropertyView, _super);
    function DropdownPropertyView(typeName, propertyKey, property) {
        _super.call(this);
        this.template = '' +
            '<tr class="property">' +
            '   <td class="vert-align">{0}</td>' +
            '   <td class="vert-align">' +
            '       <select id="{1}" class="mydropdown" data-type="{2}">' +
            '           {3}' +
            '       </select>' +
            '   </td>' +
            '</tr>';
        var variantsList = VariantListMapper.getVariantList(typeName, propertyKey);
        var options = '';
        for (var i = 0; i < variantsList.length; i++) {
            var variant = variantsList[i];
            var selected = "";
            if (variant.getKey() === property.value) {
                selected = 'selected = "selected" ';
            }
            options += '<option ' + selected + 'value="' + variant.getKey() + '">' + variant.getValue() + '</option>';
        }
        this.content = StringUtils.format(this.template, property.name, propertyKey + "Property", propertyKey, options);
    }
    return DropdownPropertyView;
}(HtmlView));
var SpinnerPropertyView = (function (_super) {
    __extends(SpinnerPropertyView, _super);
    function SpinnerPropertyView(propertyKey, property) {
        _super.call(this);
        this.template = '' +
            '<tr class="property">' +
            '   <td class="vert-align">{0}</td>' +
            '   <td class="vert-align">' +
            '       <input id="{1}" type="number" data-type="{2}" class="spinner" value="{3}">' +
            '   </td>' +
            '</tr>';
        this.content = StringUtils.format(this.template, property.name, propertyKey + "Property", propertyKey, property.value);
    }
    return SpinnerPropertyView;
}(HtmlView));
var PropertyViewFactory = (function () {
    function PropertyViewFactory() {
    }
    PropertyViewFactory.prototype.createView = function (nodeId, typeName, propertyKey, property) {
        switch (property.type) {
            case "string":
            case "combobox":
                return new StringPropertyView(nodeId, propertyKey, property);
            case "checkbox":
                return new CheckboxPropertyView(typeName, propertyKey, property);
            case "dropdown":
                return new DropdownPropertyView(typeName, propertyKey, property);
            case "spinner":
                return new SpinnerPropertyView(propertyKey, property);
        }
    };
    return PropertyViewFactory;
}());
var PropertyEditorController = (function () {
    function PropertyEditorController(sceneController, undoRedoController) {
        this.propertyViewFactory = new PropertyViewFactory();
        this.sceneController = sceneController;
        this.undoRedoController = undoRedoController;
        this.initInputStringListener();
        this.initCheckboxListener();
        this.initDropdownListener();
        this.initSpinnerListener();
        document.addEventListener('property-changed', function (e) {
            $("." + e.detail.key + "-" + e.detail.nodeId).each(function (index) {
                if ($(this).val() !== e.detail.value) {
                    $(this).val(e.detail.value);
                    $(this).trigger('autosize');
                }
            });
        }, false);
    }
    PropertyEditorController.prototype.setNodeProperties = function (element) {
        $('#property_table tbody').empty();
        var properties = element.getChangeableProperties();
        for (var property in properties) {
            var propertyView = this.propertyViewFactory.createView(element.getLogicalId(), element.getType(), property, properties[property]);
            var htmlElement = $(propertyView.getContent());
            $('#property_table tbody').append(htmlElement);
            if (properties[property].type === "combobox") {
                this.initCombobox(element.getType(), property, htmlElement);
            }
        }
    };
    PropertyEditorController.prototype.addChangePropertyCommand = function (key, value, changeHtmlFunction) {
        var currentElement = this.sceneController.getCurrentElement();
        var property = currentElement.getChangeableProperties()[key];
        var changePropertyCommand = new ChangePropertyCommand(key, value, property.value, this.setProperty.bind(this), changeHtmlFunction);
        this.undoRedoController.addCommand(changePropertyCommand);
    };
    PropertyEditorController.prototype.clearState = function () {
        $(".property").remove();
    };
    PropertyEditorController.prototype.setProperty = function (key, value) {
        var currentElement = this.sceneController.getCurrentElement();
        var property = currentElement.getChangeableProperties()[key];
        property.value = value;
        currentElement.setProperty(key, property);
    };
    PropertyEditorController.prototype.changeHtmlElementValue = function (id, value) {
        $("#" + id).val(value);
    };
    PropertyEditorController.prototype.changeCheckboxHtml = function (id, value) {
        var tr = $("#" + id).closest('tr');
        var label = $("#" + id).find('label');
        var checkBoxInput = $("#" + id).find('input');
        if (value === "true") {
            label.contents().last()[0].textContent = $("#" + id).data("true");
            checkBoxInput.prop('checked', true);
        }
        else {
            label.contents().last()[0].textContent = $("#" + id).data("false");
            checkBoxInput.prop('checked', false);
        }
    };
    PropertyEditorController.prototype.initCombobox = function (typeName, propertyKey, element) {
        var variantsList = VariantListMapper.getVariantList(typeName, propertyKey);
        var controller = this;
        element.find('input').autocomplete({
            source: variantsList,
            minLength: 0,
            select: function (event, ui) {
                var key = $(this).data('type');
                var value = ui.item.value;
                controller.addChangePropertyCommand(key, value, function () { });
                controller.setProperty(key, value);
            }
        }).focus(function () {
            $(this).autocomplete("search", $(this).val());
        });
    };
    PropertyEditorController.prototype.initInputStringListener = function () {
        var controller = this;
        $(document).on('input', '.property-edit-input', function () {
            var key = $(this).data('type');
            var value = $(this).val();
            controller.addChangePropertyCommand(key, value, function () { });
            controller.setProperty(key, value);
        });
    };
    PropertyEditorController.prototype.initCheckboxListener = function () {
        var controller = this;
        $(document).on('change', '.checkbox', function () {
            var currentElement = controller.sceneController.getCurrentElement();
            var key = $(this).data('type');
            var property = currentElement.getChangeableProperties()[key];
            var currentValue = property.value;
            var newValue = controller.changeCheckboxValue(currentValue);
            controller.addChangePropertyCommand(key, newValue, controller.changeCheckboxHtml.bind(controller, $(this).attr("id")));
            controller.changeCheckboxHtml($(this).attr("id"), newValue);
            controller.setProperty(key, newValue);
        });
    };
    PropertyEditorController.prototype.initDropdownListener = function () {
        var controller = this;
        $(document).on('change', '.mydropdown', function () {
            var key = $(this).data('type');
            var value = $(this).val();
            controller.addChangePropertyCommand(key, value, controller.changeHtmlElementValue.bind(controller, $(this).attr("id")));
            controller.setProperty(key, value);
        });
    };
    PropertyEditorController.prototype.initSpinnerListener = function () {
        var controller = this;
        $(document).on('change', '.spinner', function () {
            var key = $(this).data('type');
            var value = $(this).val();
            if (value !== "" && !isNaN(value)) {
                controller.addChangePropertyCommand(key, value, controller.changeHtmlElementValue.bind(controller, $(this).attr("id")));
                controller.setProperty(key, value);
            }
        });
    };
    PropertyEditorController.prototype.changeCheckboxValue = function (value) {
        return (value === "true") ? "false" : "true";
    };
    return PropertyEditorController;
}());
var ElementTypes = (function () {
    function ElementTypes() {
        this.uncategorisedTypes = {};
        this.paletteTypes = new PaletteTypes();
    }
    return ElementTypes;
}());
var TypesParser = (function () {
    function TypesParser() {
    }
    TypesParser.prototype.parse = function (typesJson) {
        var diagramElementTypes = new ElementTypes();
        var elementsTypesMap = this.parseElementsTypes(typesJson.elements);
        var generalTypesMap = this.parseGeneralTypes(typesJson.blocks.general);
        diagramElementTypes.uncategorisedTypes = $.extend(elementsTypesMap, generalTypesMap);
        diagramElementTypes.paletteTypes = this.parsePaletteTypes(typesJson.blocks.palette);
        return diagramElementTypes;
    };
    TypesParser.prototype.parseElementsTypes = function (elementsTypes) {
        var elementsTypesMap = {};
        for (var i in elementsTypes) {
            var typeObject = elementsTypes[i];
            var typeName = typeObject.type;
            elementsTypesMap[typeName] = this.createNodeType(typeObject);
        }
        return elementsTypesMap;
    };
    TypesParser.prototype.parseGeneralTypes = function (generalTypes) {
        var generalTypesMap = {};
        for (var i in generalTypes) {
            var typeObject = generalTypes[i];
            var typeName = typeObject.type;
            generalTypesMap[typeName] = this.createNodeType(typeObject);
        }
        return generalTypesMap;
    };
    TypesParser.prototype.parsePaletteTypes = function (paletteTypes) {
        var paletteTypesObject = new PaletteTypes();
        for (var category in paletteTypes) {
            var categoryTypesMap = {};
            for (var i in paletteTypes[category]) {
                var typeObject = paletteTypes[category][i];
                var typeName = typeObject.type;
                categoryTypesMap[typeName] = this.createNodeType(typeObject);
            }
            paletteTypesObject.categories[category] = categoryTypesMap;
        }
        return paletteTypesObject;
    };
    TypesParser.prototype.createNodeType = function (typeObject) {
        var name = typeObject.name;
        var typeName = typeObject.type;
        var elementTypeProperties = this.parseTypeProperties(typeName, typeObject.properties);
        var imageElement = typeObject.image;
        if (imageElement) {
            var image = GeneralConstants.APP_ROOT_PATH + imageElement.src;
            return new NodeType(name, elementTypeProperties, image);
        }
        else {
            return new NodeType(name, elementTypeProperties);
        }
    };
    TypesParser.prototype.parseTypeProperties = function (typeName, propertiesArrayNode) {
        var properties = {};
        for (var i in propertiesArrayNode) {
            var propertyObject = propertiesArrayNode[i];
            var propertyKey = propertyObject.key;
            var propertyName = propertyObject.name;
            var propertyType = propertyObject.type;
            if (propertyType === "dropdown" || propertyType === "combobox" || propertyType === "checkbox") {
                this.addVariantList(typeName, propertyKey, propertyObject.variants);
            }
            var propertyValue = "";
            if (propertyObject.value) {
                propertyValue = propertyObject.value;
            }
            else if (propertyObject.selected) {
                propertyValue = propertyObject.selected.key;
            }
            var property = new Property(propertyName, propertyType, propertyValue);
            properties[propertyKey] = property;
        }
        return properties;
    };
    TypesParser.prototype.addVariantList = function (typeName, propertyKey, variantsArrayNode) {
        var variants = [];
        for (var i in variantsArrayNode) {
            var variant = variantsArrayNode[i];
            variants.push(new Variant(variant.key, variant.value));
        }
        VariantListMapper.addVariantList(typeName, propertyKey, variants);
    };
    return TypesParser;
}());
var ElementsTypeLoader = (function () {
    function ElementsTypeLoader() {
    }
    ElementsTypeLoader.prototype.load = function (callback, task) {
        var typesParser = new TypesParser();
        $.ajax({
            type: 'POST',
            url: 'getTypes/',
            dataType: 'json',
            data: {
                'task': ((task) ? task : "")
            },
            success: function (response) {
                callback(typesParser.parse(response));
            },
            error: function (response, status, error) {
                alert("Element types loading error: " + status + " " + error);
            }
        });
    };
    return ElementsTypeLoader;
}());
var SubprogramDiagramNode = (function () {
    function SubprogramDiagramNode(logicalId, name) {
        this.type = "SubprogramDiagram";
        this.logicalId = logicalId;
        this.name = name;
        this.initProperties(name);
    }
    SubprogramDiagramNode.prototype.getLogicalId = function () {
        return this.logicalId;
    };
    SubprogramDiagramNode.prototype.getType = function () {
        return this.type;
    };
    SubprogramDiagramNode.prototype.getName = function () {
        return this.name;
    };
    SubprogramDiagramNode.prototype.getProperties = function () {
        return this.properties;
    };
    SubprogramDiagramNode.prototype.initProperties = function (name) {
        this.properties = {};
        this.properties["name"] = new Property("name", "QString", name);
        this.properties["from"] = new Property("from", "qReal::Id", "qrm:/ROOT_ID/ROOT_ID/ROOT_ID/ROOT_ID");
        this.properties["linkShape"] = new Property("linkShape", "int", "0");
        this.properties["outgoingExplosion"] = new Property("outgoingExplosion", "qReal::Id", "qrm:/");
        this.properties["to"] = new Property("to", "qReal::Id", "qrm:/ROOT_ID/ROOT_ID/ROOT_ID/ROOT_ID");
    };
    return SubprogramDiagramNode;
}());
var SubprogramPaletteElementView = (function (_super) {
    __extends(SubprogramPaletteElementView, _super);
    function SubprogramPaletteElementView(typeName, name, imageSrc, nodeLogicalId) {
        _super.call(this);
        this.imageWidth = 30;
        this.imageHeight = 30;
        this.template = '' +
            '<li>' +
            '   <div class="tree-element" data-type="{0}" data-name="{1}" data-id="{2}">' +
            '       <img class="element-img" src="{3}" width="{4}" height="{5}">' +
            '       {6}' +
            '   </div>' +
            '</li>';
        this.content = StringUtils.format(this.template, typeName, name, nodeLogicalId, imageSrc, this.imageWidth.toString(), this.imageHeight.toString(), name);
    }
    return SubprogramPaletteElementView;
}(HtmlView));
var SubprogramPaletteView = (function (_super) {
    __extends(SubprogramPaletteView, _super);
    function SubprogramPaletteView(subprogramDiagramNodes, subprogramImageSrc) {
        _super.call(this);
        var typeName = "Subprogram";
        for (var i in subprogramDiagramNodes) {
            var node = subprogramDiagramNodes[i];
            var nodeView = new SubprogramPaletteElementView(typeName, node.getName(), subprogramImageSrc, node.getLogicalId());
            this.content += nodeView.getContent();
        }
    }
    return SubprogramPaletteView;
}(HtmlView));
var PaletteElementView = (function (_super) {
    __extends(PaletteElementView, _super);
    function PaletteElementView(typeName, name, imageSrc) {
        _super.call(this);
        this.imageWidth = 30;
        this.imageHeight = 30;
        this.template = '' +
            '<li>' +
            '   <div class="tree-element" data-type="{0}">' +
            '       <img class="element-img" src="{1}" width="{2}" height="{3}">' +
            '       {4}' +
            '   </div>' +
            '</li>';
        this.content = StringUtils.format(this.template, typeName, imageSrc, this.imageWidth.toString(), this.imageHeight.toString(), name);
    }
    return PaletteElementView;
}(HtmlView));
var CategoryView = (function (_super) {
    __extends(CategoryView, _super);
    function CategoryView(categoryName, category) {
        _super.call(this);
        this.template = '' +
            '<li>' +
            '   <p>{0}</p>' +
            '   <ul>{1}</ul>' +
            '</li>';
        var elementsContent = '';
        for (var typeName in category) {
            var nodeType = category[typeName];
            var nodeName = nodeType.getName();
            var paletteElementView = new PaletteElementView(typeName, nodeName, nodeType.getImage());
            elementsContent += paletteElementView.getContent();
        }
        this.content = StringUtils.format(this.template, categoryName, elementsContent);
    }
    return CategoryView;
}(HtmlView));
var BlocksPaletteView = (function (_super) {
    __extends(BlocksPaletteView, _super);
    function BlocksPaletteView(paletteTypes) {
        _super.call(this);
        var categories = paletteTypes.categories;
        for (var categoryName in categories) {
            var category = categories[categoryName];
            var categoryView = new CategoryView(categoryName, category);
            this.content += categoryView.getContent();
        }
    }
    return BlocksPaletteView;
}(HtmlView));
var PaletteController = (function () {
    function PaletteController() {
    }
    PaletteController.prototype.initDraggable = function () {
        $(".tree-element").draggable({
            helper: function () {
                var clone = $(this).find('.element-img').clone();
                clone.css('position', 'fixed');
                clone.css('z-index', '1000');
                return clone;
            },
            cursorAt: {
                top: 15,
                left: 15
            },
            revert: "invalid"
        });
    };
    PaletteController.prototype.appendSubprogramsPalette = function (subprogramDiagramNodes, nodeTypesMap) {
        var typeName = "Subprogram";
        var paletteView = new SubprogramPaletteView(subprogramDiagramNodes, nodeTypesMap[typeName].getImage());
        this.appendPaletteContent("#subprograms-navigation", paletteView.getContent());
    };
    PaletteController.prototype.appendBlocksPalette = function (paletteTypes) {
        var paletteView = new BlocksPaletteView(paletteTypes);
        this.appendPaletteContent("#blocks-navigation", paletteView.getContent());
    };
    PaletteController.prototype.appendPaletteContent = function (selector, content) {
        $(selector).append(content);
        $(selector).treeview({
            persist: "location"
        });
    };
    return PaletteController;
}());
var DiagramParts = (function () {
    function DiagramParts(nodesMap, linksMap, subprogramDiagramNodes) {
        this.subprogramDiagramNodes = [];
        this.nodesMap = nodesMap || {};
        this.linksMap = linksMap || {};
        this.subprogramDiagramNodes = subprogramDiagramNodes || [];
    }
    return DiagramParts;
}());
var MathUtils = (function () {
    function MathUtils() {
    }
    MathUtils.toDeg = function (radians) {
        return radians * (180 / Math.PI);
    };
    MathUtils.toRad = function (degrees) {
        return degrees * (Math.PI / 180);
    };
    MathUtils.twoPointLenght = function (x1, y1, x2, y2) {
        return Math.sqrt(this.sqr(x1 - x2) + this.sqr(y1 - y2));
    };
    MathUtils.sqr = function (x) {
        return x * x;
    };
    MathUtils.min = function (a, b) {
        return (a < b) ? a : b;
    };
    MathUtils.toRadians = function (angle) {
        return angle * Math.PI / 180.0;
    };
    MathUtils.toDegrees = function (angle) {
        return angle * 180.0 / Math.PI;
    };
    MathUtils.rotateVector = function (x, y, angle) {
        angle = MathUtils.toRadians(angle);
        var newX = x * Math.cos(angle) - y * Math.sin(angle);
        var newY = x * Math.sin(angle) + y * Math.cos(angle);
        return { x: newX, y: newY };
    };
    return MathUtils;
}());
var DiagramJsonParser = (function () {
    function DiagramJsonParser() {
    }
    DiagramJsonParser.prototype.parse = function (diagramJson, nodeTypesMap) {
        var minPos = this.findMinPosition(diagramJson, nodeTypesMap);
        var minOffset = 25;
        var offsetX = (minPos.x < 0) ? (-minPos.x + minOffset) : minOffset;
        var offsetY = (minPos.y < 0) ? (-minPos.y + minOffset) : minOffset;
        var diagramParts = this.parseNodes(diagramJson, nodeTypesMap, offsetX, offsetY);
        diagramParts.linksMap = this.parseLinks(diagramJson, offsetX, offsetY);
        return diagramParts;
    };
    DiagramJsonParser.prototype.findMinPosition = function (diagramJson, nodeTypesMap) {
        var minX = Infinity;
        var minY = Infinity;
        for (var i = 0; i < diagramJson.nodes.length; i++) {
            var nodeObject = diagramJson.nodes[i];
            var type = nodeObject.type;
            if (nodeTypesMap[type]) {
                var graphicalPropertiesObject = nodeObject.graphicalProperties;
                var x = 0;
                var y = 0;
                for (var j = 0; j < graphicalPropertiesObject.length; j++) {
                    if (graphicalPropertiesObject[j].name === "position") {
                        var position = graphicalPropertiesObject[j].value;
                        var parts = position.split(", ");
                        x = parseFloat(parts[0]);
                        y = parseFloat(parts[1]);
                        minX = MathUtils.min(x, minX);
                        minY = MathUtils.min(y, minY);
                    }
                }
            }
        }
        return { x: minX, y: minY };
    };
    DiagramJsonParser.prototype.parseNodes = function (diagramJson, nodeTypesMap, offsetX, offsetY) {
        var diagramParts = new DiagramParts();
        for (var i = 0; i < diagramJson.nodes.length; i++) {
            var nodeObject = diagramJson.nodes[i];
            var type = nodeObject.type;
            if (type === "SubprogramDiagram") {
                diagramParts.subprogramDiagramNodes.push(this.parseSubprogramDiagram(nodeObject));
            }
            else {
                if (nodeTypesMap[type]) {
                    diagramParts.nodesMap[nodeObject.graphicalId] = this.parseDiagramNodeObject(nodeObject, nodeTypesMap, offsetX, offsetY);
                }
            }
        }
        return diagramParts;
    };
    DiagramJsonParser.prototype.parseSubprogramDiagram = function (nodeObject) {
        var name = "";
        var logicalPropertiesObject = nodeObject.logicalProperties;
        for (var i = 0; i < logicalPropertiesObject.length; i++) {
            var propertyName = logicalPropertiesObject[i].name;
            if (propertyName === "name") {
                name = logicalPropertiesObject[i].value;
            }
        }
        return new SubprogramDiagramNode(nodeObject.logicalId, name);
    };
    DiagramJsonParser.prototype.parseDiagramNodeObject = function (nodeObject, nodeTypesMap, offsetX, offsetY) {
        var changeableLogicalProperties = {};
        var constLogicalProperties = {};
        var subprogramDiagramId = "";
        var name = "";
        var type = nodeObject.type;
        var logicalPropertiesObject = nodeObject.logicalProperties;
        var typeProperties = nodeTypesMap[nodeObject.type].getPropertiesMap();
        logicalPropertiesObject.sort(function (a, b) {
            if (a.name < b.name)
                return -1;
            if (a.name > b.name)
                return 1;
            return 0;
        });
        for (var j = 0; j < logicalPropertiesObject.length; j++) {
            var propertyName = logicalPropertiesObject[j].name;
            if (propertyName === "name") {
                name = logicalPropertiesObject[j].value;
            }
            if (propertyName === "outgoingExplosion") {
                var outgoingExplosionId = this.parseId(logicalPropertiesObject[j].value);
                if (outgoingExplosionId) {
                    subprogramDiagramId = outgoingExplosionId;
                }
            }
            if (typeProperties.hasOwnProperty(propertyName)) {
                var property = new Property(typeProperties[propertyName].name, typeProperties[propertyName].type, logicalPropertiesObject[j].value);
                changeableLogicalProperties[propertyName] = property;
            }
            else {
                var property = new Property(logicalPropertiesObject[j].name, logicalPropertiesObject[j].type, logicalPropertiesObject[j].value);
                constLogicalProperties[propertyName] = property;
            }
        }
        var constGraphicalProperties = {};
        var graphicalPropertiesObject = nodeObject.graphicalProperties;
        var x = 0;
        var y = 0;
        for (var j = 0; j < graphicalPropertiesObject.length; j++) {
            var propertyName = graphicalPropertiesObject[j].name;
            if (propertyName === "position") {
                var position = graphicalPropertiesObject[j].value;
                var positionNums = this.parsePosition(position);
                x = positionNums.x + offsetX;
                y = positionNums.y + offsetY;
            }
            else {
                var property = new Property(graphicalPropertiesObject[j].name, graphicalPropertiesObject[j].type, graphicalPropertiesObject[j].value);
                constGraphicalProperties[propertyName] = property;
            }
        }
        var node;
        if (subprogramDiagramId) {
            node = new SubprogramNode(name, type, x, y, changeableLogicalProperties, nodeTypesMap[nodeObject.type].getImage(), subprogramDiagramId, nodeObject.graphicalId, new PropertiesPack(constLogicalProperties, constGraphicalProperties));
        }
        else {
            node = new DefaultDiagramNode(name, type, x, y, changeableLogicalProperties, nodeTypesMap[nodeObject.type].getImage(), nodeObject.graphicalId, new PropertiesPack(constLogicalProperties, constGraphicalProperties));
        }
        return node;
    };
    DiagramJsonParser.prototype.parseLinks = function (diagramJson, offsetX, offsetY) {
        var linksMap = {};
        for (var i = 0; i < diagramJson.links.length; i++) {
            linksMap[diagramJson.links[i].graphicalId] = this.parseLinkObject(diagramJson.links[i], offsetX, offsetY);
        }
        return linksMap;
    };
    DiagramJsonParser.prototype.parseLinkObject = function (linkObject, offsetX, offsetY) {
        var sourceId = "";
        var targetId = "";
        var properties = {};
        var logicalPropertiesObject = linkObject.logicalProperties;
        for (var j = 0; j < logicalPropertiesObject.length; j++) {
            switch (logicalPropertiesObject[j].name) {
                case "Guard":
                    var property = new Property("Guard", "combobox", logicalPropertiesObject[j].value);
                    properties["Guard"] = property;
                    break;
            }
        }
        var graphicalPropertiesObject = linkObject.graphicalProperties;
        var vertices = [];
        var linkPosition;
        var configuration = "";
        for (var j = 0; j < graphicalPropertiesObject.length; j++) {
            switch (graphicalPropertiesObject[j].name) {
                case "from":
                    sourceId = this.parseId(graphicalPropertiesObject[j].value);
                    break;
                case "to":
                    targetId = this.parseId(graphicalPropertiesObject[j].value);
                    break;
                case "position":
                    linkPosition = this.parsePosition(graphicalPropertiesObject[j].value);
                    break;
                case "configuration":
                    configuration = graphicalPropertiesObject[j].value;
                    vertices = this.parseVertices(graphicalPropertiesObject[j].value);
                    break;
                default:
            }
        }
        vertices.forEach(function (vertex) {
            vertex.x += linkPosition.x + offsetX;
            vertex.y += linkPosition.y + offsetY;
        });
        var jointObjectId = linkObject.graphicalId;
        var sourceObject;
        if (sourceId !== "ROOT_ID") {
            sourceObject = { id: sourceId };
        }
        else {
            var sourcePosition = this.getSourcePosition(configuration);
            sourcePosition.x += linkPosition.x + offsetX;
            sourcePosition.y += linkPosition.y + offsetY;
            sourceObject = sourcePosition;
        }
        var targetObject;
        if (targetId !== "ROOT_ID") {
            targetObject = { id: targetId };
        }
        else {
            var targetPosition = this.getTargetPosition(configuration);
            targetPosition.x += linkPosition.x + offsetX;
            targetPosition.y += linkPosition.y + offsetY;
            targetObject = targetPosition;
        }
        var jointObject = new joint.dia.Link({
            id: jointObjectId,
            attrs: {
                '.connection': { stroke: 'black' },
                '.marker-target': { fill: 'black', d: 'M 10 0 L 0 5 L 10 10 z' }
            },
            source: sourceObject,
            target: targetObject,
            vertices: vertices
        });
        return new Link(jointObject, properties);
    };
    DiagramJsonParser.prototype.parseVertices = function (configuration) {
        var vertices = [];
        var parts = configuration.split(" : ");
        for (var k = 1; k < parts.length - 2; k++) {
            vertices.push(this.parsePosition(parts[k]));
        }
        return vertices;
    };
    DiagramJsonParser.prototype.getSourcePosition = function (configuration) {
        var parts = configuration.split(" : ");
        var position = this.parsePosition(parts[0]);
        position.x = Math.floor(position.x);
        position.x = position.x - position.x % 5;
        position.y = Math.floor(position.y);
        position.y = position.y - position.y % 5;
        return position;
    };
    DiagramJsonParser.prototype.getTargetPosition = function (configuration) {
        var parts = configuration.split(" : ");
        var position = this.parsePosition(parts[parts.length - 2]);
        position.x = Math.floor(position.x);
        position.x = position.x - position.x % 5;
        position.y = Math.floor(position.y);
        position.y = position.y - position.y % 5;
        return position;
    };
    DiagramJsonParser.prototype.parsePosition = function (position) {
        var parts = position.split(", ");
        return { x: parseFloat(parts[0]), y: parseFloat(parts[1]) };
    };
    DiagramJsonParser.prototype.parseId = function (idString) {
        var parts = idString.split("/");
        var id = parts[parts.length - 1];
        var expr = /{(.*)}/gi;
        return id.replace(expr, "$1");
    };
    return DiagramJsonParser;
}());
var DiagramExporter = (function () {
    function DiagramExporter() {
    }
    DiagramExporter.prototype.exportDiagramStateToJSON = function (graph, diagramParts) {
        var json = {
            'nodes': [],
            'links': []
        };
        json.nodes = json.nodes.concat(this.exportNodes(graph, diagramParts));
        json.links = this.exportLinks(diagramParts);
        return json;
    };
    DiagramExporter.prototype.exportNodes = function (graph, diagramParts) {
        var nodes = [];
        for (var id in diagramParts.nodesMap) {
            var node = diagramParts.nodesMap[id];
            var nodeJSON = {
                'logicalId': node.getLogicalId(),
                'graphicalId': node.getJointObject().id,
                'type': node.getType(),
                'logicalChildren': [],
                'graphicalChildren': [],
                'logicalLinksIds': [],
                'graphicalLinksIds': [],
                'logicalProperties': [],
                'graphicalProperties': [],
                'incomingExplosions': []
            };
            var constLogicalProperties = node.getConstPropertiesPack().logical;
            if (node.getType() === "Subprogram") {
                constLogicalProperties["outgoingExplosion"] = new Property("outgoingExplosion", "qReal::Id", "qrm:/RobotsMetamodel/RobotsDiagram/SubprogramDiagram/{" +
                    node.getSubprogramDiagramId() + "}");
            }
            var changeableLogicalPropertiesArray = this.exportProperties(node.getChangeableProperties());
            var constLogicalPropertiesArray = this.exportProperties(constLogicalProperties);
            nodeJSON.logicalProperties = changeableLogicalPropertiesArray.concat(constLogicalPropertiesArray);
            nodeJSON.graphicalProperties = this.exportProperties(node.getConstPropertiesPack().graphical);
            nodeJSON.graphicalProperties.push({
                "name": "position",
                "value": "" + node.getX() + ", " + node.getY(),
                "type": "QPointF"
            });
            var graphicalLinks = graph.getConnectedLinks(node.getJointObject(), { inbound: true, outbound: true });
            graphicalLinks.forEach(function (link) {
                nodeJSON.graphicalLinksIds.push({ 'id': link.id });
                nodeJSON.logicalLinksIds.push({ 'id': diagramParts.linksMap[link.id].getLogicalId() });
            });
            nodes.push(nodeJSON);
        }
        return nodes;
    };
    DiagramExporter.prototype.exportLinks = function (diagramParts) {
        var links = [];
        for (var id in diagramParts.linksMap) {
            var link = diagramParts.linksMap[id];
            var jointObject = link.getJointObject();
            if (jointObject.get('vertices')) {
                var vertices = this.exportVertices(jointObject);
            }
            var linkJSON = {
                'logicalId': link.getLogicalId(),
                'graphicalId': jointObject.id,
                'type': link.getType(),
                'logicalChildren': [],
                'graphicalChildren': [],
                'logicalLinksIds': [],
                'graphicalLinksIds': [],
                'logicalProperties': [],
                'graphicalProperties': [],
                'incomingExplosions': []
            };
            var changeableLogicalProperties = this.exportProperties(link.getChangeableProperties());
            var constLogicalProperties = this.exportProperties(link.getConstPropertiesPack().logical);
            linkJSON.logicalProperties = changeableLogicalProperties.concat(constLogicalProperties);
            linkJSON.graphicalProperties = this.exportProperties(link.getConstPropertiesPack().graphical);
            var sourceObject = diagramParts.nodesMap[jointObject.get('source').id];
            var targetObject = diagramParts.nodesMap[jointObject.get('target').id];
            var logicalSourceValue = (sourceObject) ? sourceObject.getType() +
                "/{" + sourceObject.getLogicalId() + "}" :
                "qrm:/ROOT_ID/ROOT_ID/ROOT_ID/ROOT_ID";
            var logicalSource = {
                'name': "from",
                'value': "qrm:/RobotsMetamodel/RobotsDiagram/" + logicalSourceValue,
                'type': "qReal::Id"
            };
            var logicalTargetValue = (targetObject) ? targetObject.getType() +
                "/{" + targetObject.getLogicalId() + "}" :
                "qrm:/ROOT_ID/ROOT_ID/ROOT_ID/ROOT_ID";
            var logicalTarget = {
                'name': "to",
                'value': "qrm:/RobotsMetamodel/RobotsDiagram/" + logicalTargetValue,
                'type': "qReal::Id"
            };
            linkJSON.logicalProperties.push(logicalSource);
            linkJSON.logicalProperties.push(logicalTarget);
            var graphicalSourceValue = (sourceObject) ? sourceObject.getType() +
                "/{" + jointObject.get('source').id + "}" :
                "qrm:/ROOT_ID/ROOT_ID/ROOT_ID/ROOT_ID";
            var graphicalSource = {
                'name': "from",
                'value': "qrm:/RobotsMetamodel/RobotsDiagram/" + graphicalSourceValue,
                'type': "qReal::Id"
            };
            var graphicalTargetValue = (targetObject) ? targetObject.getType() +
                "/{" + jointObject.get('target').id + "}" :
                "qrm:/ROOT_ID/ROOT_ID/ROOT_ID/ROOT_ID";
            var graphicalTarget = {
                'name': "to",
                'value': "qrm:/RobotsMetamodel/RobotsDiagram/" + graphicalTargetValue,
                'type': "qReal::Id"
            };
            linkJSON.graphicalProperties.push(graphicalSource);
            linkJSON.graphicalProperties.push(graphicalTarget);
            links.push(linkJSON);
        }
        return links;
    };
    DiagramExporter.prototype.exportProperties = function (properties) {
        var propertiesJSON = [];
        for (var propertyName in properties) {
            var type = properties[propertyName].type;
            type = (type === "string" || type === "combobox" || type == "checkbox" || type == "dropdown") ?
                "QString" : type;
            var property = {
                'name': propertyName,
                'value': properties[propertyName].value,
                'type': type
            };
            propertiesJSON.push(property);
        }
        return propertiesJSON;
    };
    DiagramExporter.prototype.exportVertices = function (jointObject) {
        var vertices = jointObject.get('vertices');
        var verticesStr = (jointObject.get('source').id) ? "0, 0 : " :
            "" + jointObject.get('source').x + ", " + jointObject.get('source').y + " : ";
        if (vertices) {
            vertices.forEach(function (vertex) {
                verticesStr += vertex.x + ", " + vertex.y + " : ";
            });
        }
        return verticesStr + (jointObject.get('target').id ? "0, 0 : " :
            "" + jointObject.get('target').x + ", " + jointObject.get('target').y + " : ");
    };
    return DiagramExporter;
}());
var DiagramEditor = (function () {
    function DiagramEditor() {
        this.graph = new joint.dia.Graph;
        this.scene = new DiagramScene("diagram-scene", this.graph);
    }
    DiagramEditor.prototype.getGraph = function () {
        return this.graph;
    };
    DiagramEditor.prototype.getScene = function () {
        return this.scene;
    };
    DiagramEditor.prototype.clear = function () {
        this.scene.clear();
        this.graph.clear();
    };
    return DiagramEditor;
}());
var DiagramEditorController = (function () {
    function DiagramEditorController($scope, $attrs) {
        var _this = this;
        this.undoRedoController = new UndoRedoController();
        this.nodeTypesMap = {};
        this.paletteController = new PaletteController();
        DiagramElementListener.getNodeProperties = function (type) {
            return _this.getNodeProperties(type);
        };
        this.diagramEditor = new DiagramEditor();
        this.sceneController = new SceneController(this, this.diagramEditor.getScene());
        this.elementsTypeLoader = new ElementsTypeLoader();
        $scope.undo = function () {
            _this.undoRedoController.undo();
        };
        $scope.redo = function () {
            _this.undoRedoController.redo();
        };
        $(document).bind("mousedown", function (e) {
            if (!($(e.target).parents(".custom-menu").length > 0)) {
                $(".custom-menu").hide(100);
            }
        });
    }
    DiagramEditorController.prototype.getGraph = function () {
        return this.diagramEditor.getGraph();
    };
    DiagramEditorController.prototype.getNodesMap = function () {
        var paper = this.diagramEditor.getScene();
        return paper.getNodesMap();
    };
    DiagramEditorController.prototype.getLinksMap = function () {
        var paper = this.diagramEditor.getScene();
        return paper.getLinksMap();
    };
    DiagramEditorController.prototype.setNodeProperties = function (element) {
        this.propertyEditorController.setNodeProperties(element);
    };
    DiagramEditorController.prototype.clearNodeProperties = function () {
        this.propertyEditorController.clearState();
    };
    DiagramEditorController.prototype.getNodeType = function (type) {
        return this.nodeTypesMap[type];
    };
    DiagramEditorController.prototype.getNodeProperties = function (type) {
        return this.nodeTypesMap[type].getPropertiesMap();
    };
    DiagramEditorController.prototype.getUndoRedoController = function () {
        return this.undoRedoController;
    };
    DiagramEditorController.prototype.clearState = function () {
        this.propertyEditorController.clearState();
        this.sceneController.clearState();
        this.diagramEditor.clear();
        this.undoRedoController.clearStack();
    };
    DiagramEditorController.prototype.getDiagramParts = function () {
        return new DiagramParts(this.getNodesMap(), this.getLinksMap());
    };
    DiagramEditorController.prototype.getNodeTypes = function () {
        return this.nodeTypesMap;
    };
    DiagramEditorController.prototype.addFromMap = function (diagramParts) {
        var scene = this.diagramEditor.getScene();
        scene.addNodesFromMap(diagramParts.nodesMap);
        scene.addLinksFromMap(diagramParts.linksMap);
    };
    return DiagramEditorController;
}());
var UIDGenerator = (function () {
    function UIDGenerator() {
    }
    UIDGenerator.generate = function () {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };
    return UIDGenerator;
}());
var UndoRedoController = (function () {
    function UndoRedoController() {
        var _this = this;
        this.maxSize = 10000;
        this.stack = [];
        this.pointer = -1;
        var zKey = 90;
        this.keyDownHandler = function (event) {
            if ($("#diagram-area").is(":visible")) {
                if (event.keyCode == zKey && event.ctrlKey && event.shiftKey) {
                    event.preventDefault();
                    _this.redo();
                }
                else if (event.keyCode == zKey && event.ctrlKey) {
                    event.preventDefault();
                    _this.undo();
                }
            }
        };
        this.bindKeyboardHandler();
    }
    UndoRedoController.prototype.addCommand = function (command) {
        if (command.isRevertible()) {
            if (this.pointer < this.stack.length - 1) {
                this.popNCommands(this.stack.length - 1 - this.pointer);
            }
            this.stack.push(command);
            if (this.stack.length > this.maxSize) {
                this.stack.shift();
            }
            else {
                this.pointer++;
            }
        }
    };
    UndoRedoController.prototype.undo = function () {
        if (this.pointer > -1) {
            this.stack[this.pointer].revert();
            this.pointer--;
        }
    };
    UndoRedoController.prototype.redo = function () {
        if (this.pointer < this.stack.length - 1) {
            this.pointer++;
            this.stack[this.pointer].execute();
        }
    };
    UndoRedoController.prototype.clearStack = function () {
        this.stack.splice(0, this.stack.length);
        this.pointer = -1;
    };
    UndoRedoController.prototype.bindKeyboardHandler = function () {
        var _this = this;
        $(document).ready(function () {
            $(document).keydown(_this.keyDownHandler);
        });
    };
    UndoRedoController.prototype.unbindKeyboardHandler = function () {
        $(document).unbind('keydown', this.keyDownHandler);
    };
    UndoRedoController.prototype.popNCommands = function (n) {
        while (n && this.stack.pop()) {
            n--;
        }
    };
    return UndoRedoController;
}());
var SubprogramNode = (function (_super) {
    __extends(SubprogramNode, _super);
    function SubprogramNode(name, type, x, y, properties, imagePath, subprogramDiagramId, id, notDefaultConstProperties) {
        _super.call(this, name, type, x, y, properties, imagePath, id, notDefaultConstProperties);
        this.subprogramDiagramId = subprogramDiagramId;
        var fontSize = 16;
        var width = (0.5 * name.length) * fontSize;
        var height = (name.split('\n').length) * fontSize;
        this.textObject = new joint.shapes.basic.Text({
            position: { x: x - 10, y: y - 20 },
            size: { width: width, height: height },
            attrs: {
                text: {
                    text: name,
                    style: { 'pointer-events': 'none' }
                },
            },
        });
    }
    SubprogramNode.prototype.getSubprogramDiagramId = function () {
        return this.subprogramDiagramId;
    };
    SubprogramNode.prototype.getTextObject = function () {
        return this.textObject;
    };
    SubprogramNode.prototype.setPosition = function (x, y, zoom) {
        _super.prototype.setPosition.call(this, x, y, zoom);
        this.textObject.position(x - 10, y - 20);
    };
    return SubprogramNode;
}(DefaultDiagramNode));
var ChangeCurrentElementCommand = (function () {
    function ChangeCurrentElementCommand(element, oldElement, executionFunction) {
        this.element = element;
        this.oldElement = oldElement;
        this.executionFunction = executionFunction;
    }
    ChangeCurrentElementCommand.prototype.execute = function () {
        this.executionFunction(this.element);
    };
    ChangeCurrentElementCommand.prototype.revert = function () {
        this.executionFunction(this.oldElement);
    };
    ChangeCurrentElementCommand.prototype.isRevertible = function () {
        return (this.oldElement !== this.element);
    };
    return ChangeCurrentElementCommand;
}());
var ChangePropertyCommand = (function () {
    function ChangePropertyCommand(key, value, oldValue, executionFunction, changeHtmlFunction) {
        this.key = key;
        this.value = value;
        this.oldValue = oldValue;
        this.executionFunction = executionFunction;
        this.changeHtmlFunction = changeHtmlFunction;
    }
    ChangePropertyCommand.prototype.execute = function () {
        this.executionFunction(this.key, this.value);
        this.changeHtmlFunction(this.value);
    };
    ChangePropertyCommand.prototype.revert = function () {
        this.executionFunction(this.key, this.oldValue);
        this.changeHtmlFunction(this.oldValue);
    };
    ChangePropertyCommand.prototype.isRevertible = function () {
        return this.oldValue !== this.value;
    };
    return ChangePropertyCommand;
}());
var CreateElementCommand = (function () {
    function CreateElementCommand(element, executionFunction, revertFunction) {
        this.element = element;
        this.executionFunction = executionFunction;
        this.revertFunction = revertFunction;
    }
    CreateElementCommand.prototype.execute = function () {
        this.executionFunction(this.element);
    };
    CreateElementCommand.prototype.revert = function () {
        this.revertFunction(this.element);
    };
    CreateElementCommand.prototype.isRevertible = function () {
        return true;
    };
    return CreateElementCommand;
}());
var MoveCommand = (function () {
    function MoveCommand(oldX, oldY, newX, newY, zoom, executionFunction) {
        this.oldX = oldX;
        this.oldY = oldY;
        this.newX = newX;
        this.newY = newY;
        this.zoom = zoom;
        this.executionFunction = executionFunction;
    }
    MoveCommand.prototype.execute = function () {
        this.executionFunction(this.newX, this.newY, this.zoom);
    };
    MoveCommand.prototype.revert = function () {
        this.executionFunction(this.oldX, this.oldY, this.zoom);
    };
    MoveCommand.prototype.isRevertible = function () {
        return !(this.newX === this.oldX && this.newY === this.oldY);
    };
    return MoveCommand;
}());
var MultiCommand = (function () {
    function MultiCommand(commands) {
        this.commands = commands;
    }
    MultiCommand.prototype.execute = function () {
        this.commands.forEach(function (command) { return command.execute(); });
    };
    MultiCommand.prototype.revert = function () {
        for (var i = this.commands.length - 1; i >= 0; i--) {
            this.commands[i].revert();
        }
    };
    MultiCommand.prototype.isRevertible = function () {
        return this.commands.reduce(function (previousValue, command) {
            return previousValue && command.isRevertible();
        }, true);
    };
    return MultiCommand;
}());
var RemoveElementCommand = (function () {
    function RemoveElementCommand(element, executionFunction, revertFunction) {
        this.element = element;
        this.executionFunction = executionFunction;
        this.revertFunction = revertFunction;
    }
    RemoveElementCommand.prototype.execute = function () {
        this.executionFunction(this.element);
    };
    RemoveElementCommand.prototype.revert = function () {
        this.revertFunction(this.element);
    };
    RemoveElementCommand.prototype.isRevertible = function () {
        return true;
    };
    return RemoveElementCommand;
}());
//# sourceMappingURL=editor-core.js.map