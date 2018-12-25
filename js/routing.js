const Vehicle = require('./vehicle')
const Point = require('./point')

let uid = 0

class Routable{
  constructor(_x, _y) {
    this.pos = new Point(_x, _y)
    this.children = []
    this.uid = uid++
  }

  delete() {}

  drawHighlight(_d) {
    _d.stroke('red')
    _d.fill('rgba(0,0,0,0)')
    _d.ellipse(this.pos.x, this.pos.y, 50)
  }
}

module.exports = {
  getClosest: (_obj, _routables) => {
    let min = undefined
    let minDist = undefined
    _routables.forEach(ro => {
      let dist = Point.distance(ro.pos, _obj)
      if (min) {
        if (dist < minDist) {
          min = ro
          minDist = dist
        }
      } else {
        min = ro
        minDist = dist
      }
    })
    return min
  },
  setUID: (_uid) => {
    uid = _uid
  },
  VehicleSource: class extends Routable {
    constructor(_x = 0, _y = 0, _interval = 0, _vehicles = []) {
      super(_x, _y)
      this.intervalTime = _interval
      if (_interval > 0) this.interval = setInterval(() => {
        if (this.children.length > 0) {
          let tempVeh = new Vehicle(this.pos.x, this.pos.y)
          let index = Math.floor(Math.random() * this.children.length)
          tempVeh.addWaypoint(this.children[index].pos)
          _vehicles.push(tempVeh)
        }
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

  VehicleSink: class extends Routable {
    constructor(_x = 0, _y = 0) {
      super(_x, _y)
    }

    draw(_d) {
      _d.fill('blue')
      _d.ellipse(this.pos.x, this.pos.y, 20)
    }
  },

  Intersection: class extends Routable {
    constructor(_x = 0, _y = 0) {
      super(_x, _y)
    }

    draw(_d) {
      _d.fill('red')
      _d.ellipse(this.pos.x, this.pos.y, 20)
    }
  }
}