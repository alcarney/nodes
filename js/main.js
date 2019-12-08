const svgns = "http://www.w3.org/2000/svg"

class Grid {
    constructor(width, height, scale) {
        this.minX = -(width / 2)
        this.maxX = width / 2

        this.minY = -(height / 2)
        this.maxY = height / 2

        this.scale = scale
        this.constructGrid()
    }

    constructGrid() {
        this.rows = []
        this.columns = []

        let x = this.minX - this.scale
        let y = this.minY - this.scale

        while (x < this.maxX) {
            x += this.scale

            const line = document.createElementNS(svgns, "line")
            line.setAttribute("x1", x)
            line.setAttribute("x2", x)
            line.setAttribute("y1", this.minY)
            line.setAttribute("y2", this.maxY)

            this.columns.push(line)
        }

        while (y < this.maxY) {
            y += this.scale

            const line = document.createElementNS(svgns, "line")
            line.setAttribute("x1", this.minX)
            line.setAttribute("x2", this.maxX)
            line.setAttribute("y1", y)
            line.setAttribute("y2", y)

            this.rows.push(line)
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

const grid = new Grid(canvas.width, canvas.height, 10)

for (let c in grid.columns) {
    canvas.canvas.appendChild(grid.columns[c])
}

for (let r in grid.rows) {
    canvas.canvas.appendChild(grid.rows[r])
}