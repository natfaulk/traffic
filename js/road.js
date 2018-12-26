const Settings = require('./settings')
const Point = require('./point')

module.exports = class Road {
  constructor(_start, _finish, _lanes = 2) {
    this.start = _start
    this.finish = _finish
    this.lanes = _lanes
  }

  draw(_d, _routing = false) {
    _d.stroke('black')
    _d.strokeWeight(Settings.LANE_WIDTH * this.lanes)
    _d.line(this.start.x, this.start.y, this.finish.x, this.finish.y)
    
    // angle of road
    let ang = Point.angle(this.start, this.finish)
    let temp = new Point()
    temp.setFromPolar(ang + Math.PI / 2, Settings.LANE_WIDTH * this.lanes / 2)
    let tempStart = new Point(this.start.x, this.start.y)
    let tempFinish = new Point(this.finish.x, this.finish.y)
    tempStart.add(temp)
    tempFinish.add(temp)
    temp.setFromPolar(ang + Math.PI / 2, -Settings.LANE_WIDTH)
    for (let i = 0; i <= this.lanes; i++) {
      _d.strokeWeight(2)
      _d.stroke('white')
      _d.line(tempStart.x, tempStart.y, tempFinish.x, tempFinish.y)
      tempStart.add(temp)
      tempFinish.add(temp)
    }
    // only display if routing display enabled
    if (_routing) {
      // Temporary arrow at the front
      temp.setFromPolar(ang + Math.PI / 2, -2 * Settings.LANE_WIDTH * this.lanes)
      tempStart = new Point(this.finish.x, this.finish.y)
      tempFinish = new Point(this.finish.x, this.finish.y)
      tempStart.add(temp)
      temp.setFromPolar(ang + Math.PI / 2, 2 * Settings.LANE_WIDTH * this.lanes)
      tempFinish.add(temp)
      _d.line(tempStart.x, tempStart.y, tempFinish.x, tempFinish.y)    
    }
  }
}