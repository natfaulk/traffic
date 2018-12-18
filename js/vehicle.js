const Point = require('./point')
const Settings = require('./settings')

module.exports = class Vehicle {
  constructor(_x = 0, _y = 0) {
    this.pos = new Point(_x, _y)
    this.size = new Point(10, 5)
    this.waypoints = []
    
    this.MAX_SPEED = 1.5
  }

  draw(_d) {
    _d.strokeWeight(1)
    _d.stroke('black')
    _d.fill('red')
    _d.rect(this.pos.x + 0.5, this.pos.y + 0.5, this.size.x, this.size.y)
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
        if (d > this.MAX_SPEED) d = this.MAX_SPEED
        let t = new Point()
        t.setFromPolar(a, d)
        this.pos.add(t)
      } else {
        this.waypoints.shift()
        this.tick()
      }
    }
  }
}