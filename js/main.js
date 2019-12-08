const svgns = "http://www.w3.org/2000/svg"

class Grid {
    constructor(scale, num) {

        this.min = -(scale / 2)
        this.max = scale / 2

        this.num = num
        this.constructGrid()
    }

    constructGrid() {
        this.lines = []

        const spacing = (this.max - this.min) / this.num

        for (let n = 0; n <= this.num; n++) {
            const p = this.min + (n * spacing)

            const col = document.createElementNS(svgns, "line")
            col.setAttribute("x1", p)
            col.setAttribute("x2", p)
            col.setAttribute("y1", this.min)
            col.setAttribute("y2", this.max)

            const row = document.createElementNS(svgns, "line")
            row.setAttribute("x1", this.min)
            row.setAttribute("x2", this.max)
            row.setAttribute("y1", p)
            row.setAttribute("y2", p)

            this.lines.push(col)
            this.lines.push(row)
        }
    }
}

class Canvas {
    constructor(root, scale) {
        this.canvas = document.createElementNS(svgns, "svg")

        this.x = 0
        this.y = 0
        this.scale = scale

        this.canvas.addEventListener('mousedown', this.onMouseDown.bind(this))
        this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this))
        this.canvas.addEventListener('mouseup', this.onMouseUp.bind(this))
        this.canvas.addEventListener('resize', this.onResize.bind(this))
        this.canvas.addEventListener('wheel', this.onScroll.bind(this))

        root.appendChild(this.canvas)
        this.calcViewBox()
    } 2

    calcViewBox() {
        const bbox = this.canvas.getBoundingClientRect()
        const aspectRatio = bbox.width / bbox.height

        this.height = this.scale
        this.width = aspectRatio * this.height

        const xMin = this.x - (this.width / 2)
        const yMin = this.y - (this.height / 2)

        const viewBoxStr = `${xMin} ${yMin} ${this.width} ${this.height}`
        this.canvas.setAttribute("viewBox", viewBoxStr)
    }

    getCanvasPos(event) {
        const bbox = this.canvas.getBoundingClientRect()

        return {
            x: (event.clientX - bbox.left) / bbox.width,
            y: (event.clientY - bbox.top) / bbox.height
        }
    }

    onMouseUp() {
        console.debug("[canvas]: mouseup")
    }

    onMouseDown(event) {
        this.pos = { x: this.x, y: this.y }
        this.click = this.getCanvasPos(event)
        console.debug("[canvas]: click", this.click)
    }

    onMouseMove(event) {
        if (event.buttons !== 1) {
            return
        }

        const mouse = this.getCanvasPos(event)
        const delta = { dx: mouse.x - this.click.x, dy: mouse.y - this.click.y }

        this.x = this.pos.x - (delta.dx * this.width)
        this.y = this.pos.y - (delta.dy * this.height)
        this.calcViewBox()

        console.debug("[canvas]: mousemove", delta)
    }

    onResize() {
        console.debug("[canvas]: resize")
        this.calcViewBox()
    }

    onScroll(event) {
        this.scale = this.scale + (event.deltaY * this.scale * 0.02)
        this.calcViewBox()

        console.debug("[canvas]: scroll", this.scale)
    }
}

const main = document.getElementById("canvas")
const canvas = new Canvas(main, 100)

const grid = new Grid(canvas.height, 25)

for (let c in grid.lines) {
    canvas.canvas.appendChild(grid.lines[c])
}
