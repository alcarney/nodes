"use strict";
var svgns = "http://www.w3.org/2000/svg";
var Grid = /** @class */ (function () {
    function Grid(scale, num) {
        this.start = -(scale / 2);
        this.stop = scale / 2;
        this.numSquares = num;
        this.elements = [];
        this.constructGrid();
    }
    Grid.prototype.constructGrid = function () {
        this.elements = [];
        var spacing = (this.stop - this.start) / this.numSquares;
        for (var n = 0; n <= this.numSquares; n++) {
            var p = (this.start + (n * spacing)).toString();
            var startVal = this.start.toString();
            var stopVal = this.stop.toString();
            var col = document.createElementNS(svgns, "line");
            col.setAttribute("x1", p);
            col.setAttribute("x2", p);
            col.setAttribute("y1", startVal);
            col.setAttribute("y2", stopVal);
            var row = document.createElementNS(svgns, "line");
            row.setAttribute("x1", startVal);
            row.setAttribute("x2", stopVal);
            row.setAttribute("y1", p);
            row.setAttribute("y2", p);
            this.elements.push(col);
            this.elements.push(row);
        }
    };
    return Grid;
}());
var EditorNode = /** @class */ (function () {
    function EditorNode() {
        this.elements = [];
        var rect = document.createElementNS(svgns, 'rect');
        rect.setAttribute("width", "20");
        rect.setAttribute("height", "20");
        rect.setAttribute("rx", "1");
        this.elements.push(rect);
    }
    return EditorNode;
}());
var Point = /** @class */ (function () {
    function Point(x, y) {
        this.x = x;
        this.y = y;
    }
    Point.prototype.minus = function (other) {
        return new Point(this.x - other.x, this.y - other.y);
    };
    return Point;
}());
var Canvas = /** @class */ (function () {
    function Canvas(root, scale) {
        this.canvas = document.createElementNS(svgns, "svg");
        this.offset = new Point(0, 0);
        this.clickPosition = new Point(0, 0);
        this.clickOffset = new Point(0, 0);
        this.width = 1;
        this.height = 1;
        this.scale = scale;
        this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this));
        this.canvas.addEventListener('resize', this.onResize.bind(this));
        this.canvas.addEventListener('wheel', this.onScroll.bind(this));
        root.appendChild(this.canvas);
        this.calcViewBox();
    }
    Canvas.prototype.calcViewBox = function () {
        var bbox = this.canvas.getBoundingClientRect();
        var aspectRatio = bbox.width / bbox.height;
        this.height = this.scale;
        this.width = aspectRatio * this.height;
        var xMin = this.offset.x - (this.width / 2);
        var yMin = this.offset.y - (this.height / 2);
        var viewBoxStr = xMin + " " + yMin + " " + this.width + " " + this.height;
        this.canvas.setAttribute("viewBox", viewBoxStr);
    };
    Canvas.prototype.getMousePosition = function (event) {
        var bbox = this.canvas.getBoundingClientRect();
        var x = (event.clientX - bbox.left) / bbox.width;
        var y = (event.clientY - bbox.top) / bbox.height;
        return new Point(x, y);
    };
    Canvas.prototype.onMouseUp = function (event) {
        console.debug("[canvas]: mouseup");
    };
    Canvas.prototype.onMouseDown = function (event) {
        this.clickOffset = new Point(this.offset.x, this.offset.y);
        this.clickPosition = this.getMousePosition(event);
        console.debug("[canvas]: click", this.clickPosition);
    };
    Canvas.prototype.onMouseMove = function (event) {
        if (event.buttons !== 1) {
            return;
        }
        var mousePos = this.getMousePosition(event);
        var delta = mousePos.minus(this.clickPosition);
        var x = this.clickOffset.x - (delta.x * this.width);
        var y = this.clickOffset.y - (delta.y * this.height);
        this.offset = new Point(x, y);
        this.calcViewBox();
        console.debug("[canvas]: mousemove", delta);
    };
    Canvas.prototype.onResize = function () {
        console.debug("[canvas]: resize");
        this.calcViewBox();
    };
    Canvas.prototype.onScroll = function (event) {
        this.scale = this.scale + (event.deltaY * this.scale * 0.02);
        this.calcViewBox();
        console.debug("[canvas]: scroll", this.scale);
    };
    Canvas.prototype.setBackground = function (item) {
        var g = document.createElementNS(svgns, 'g');
        for (var e in item.elements) {
            g.appendChild(item.elements[e]);
        }
        this.background = g;
        this.canvas.appendChild(g);
    };
    Canvas.prototype.addItem = function (item) {
        var g = document.createElementNS(svgns, 'g');
        for (var e in item.elements) {
            g.appendChild(item.elements[e]);
        }
        this.canvas.appendChild(g);
    };
    return Canvas;
}());
var main = document.getElementById("canvas");
if (main === null) {
    throw new Error("Could not find canvas element");
}
var canvas = new Canvas(main, 100);
var grid = new Grid(canvas.height, 25);
canvas.setBackground(grid);
var node = new EditorNode();
canvas.addItem(node);
//# sourceMappingURL=main.js.map