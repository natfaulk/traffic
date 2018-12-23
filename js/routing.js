const Vehicle = require('./vehicle')
const Point = require('./point')

module.exports = {
  VehicleSource: class {
    constructor(_x = 0, _y = 0) {
      this.pos = new Point(_x, _y)
    }

    draw(_d) {
      _d.fill('blue')
      _d.ellipse(this.pos.x, this.pos.y, 20)
      _d.fill('red')
      _d.rect(this.pos.x - 5, this.pos.y - 5, 10, 10)
    }
  },

  VehicleSink: class {
    constructor(_x = 0, _y = 0) {
      this.pos = new Point(_x, _y)
    }

    draw(_d) {
      _d.fill('blue')
      _d.ellipse(this.pos.x, this.pos.y, 20)
    }
  },

  Intersection: class {
    constructor(_x = 0, _y = 0) {
      this.pos = new Point(_x, _y)
    }

    draw(_d) {
      _d.fill('red')
      _d.ellipse(this.pos.x, this.pos.y, 20)
    }
  }
}