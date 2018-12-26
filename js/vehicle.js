const Point = require('./point')
const Settings = require('./settings')
const Utils = require('./utils')

module.exports = class Vehicle {
  constructor(_x = 0, _y = 0) {
    this.pos = new Point(_x, _y)
    this.angle = 0
    this.size = new Point(Settings.CAR_LENGTH, Settings.CAR_WIDTH)
    this.waypoints = []
    this.color = Utils.randomColour()
  }

  draw(_d) {
    _d.strokeWeight(1)
    _d.stroke('black')
    _d.fill(`rgb(${this.color[0]},${this.color[1]},${this.color[2]})`)
    _d.rotatedRect(this.pos.x + 0.5, this.pos.y + 0.5, this.size.x, this.size.y, this.angle)
    if (this.waypoints.length > 0) {
      _d.fill('green')
      _d.ellipse(this.waypoints[0].x, this.waypoints[0].y, 5)
    }
  }

  // setDest(_p) {
  //   this.dest = _p
  // }

  addWaypoint(_p) {
    this.waypoints.push(_p)
  }

  tick() {
    if (this.waypoints.length > 0) {
      let dest = this.waypoints[0]
      let d = Point.distance(this.pos, dest)
      if (d > Settings.DEST_THRESHOLD) {
        let a = Point.angle(dest, this.pos)
        if (d > Settings.MAX_SPEED) d = Settings.MAX_SPEED
        let t = new Point()
        t.setFromPolar(a, d)
        this.pos.add(t)
        this.angle = a
      } else {
        this.waypoints.shift()
        this.tick()
      }
    }
  }

  finished() {
    return this.waypoints.length == 0
  }
}