const Vehicle = require('./vehicle')
const Point = require('./point')

module.exports = {
  VehicleSource: class {
    constructor(_x = 0, _y = 0, _interval = 0, _vehicles = []) {
      this.pos = new Point(_x, _y)
      this.intervalTime = _interval
      if (_interval > 0) this.interval = setInterval(() => {
        let tempVeh = new Vehicle(this.pos.x, this.pos.y)
        tempVeh.addWaypoint(new Point(500, 500))
        _vehicles.push(tempVeh)
      }, _interval)
    }

    draw(_d) {
      _d.fill('blue')
      _d.ellipse(this.pos.x, this.pos.y, 20)
      _d.fill('red')
      _d.rect(this.pos.x - 5, this.pos.y - 5, 10, 10)
    }

    delete() {
      clearInterval(this.interval)
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

    delete() {}
  },

  Intersection: class {
    constructor(_x = 0, _y = 0) {
      this.pos = new Point(_x, _y)
    }

    draw(_d) {
      _d.fill('red')
      _d.ellipse(this.pos.x, this.pos.y, 20)
    }

    delete() {}
  }
}