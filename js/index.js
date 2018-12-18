const Mindrawing = require('mindrawingjs')
const Vehicle = require('./vehicle')
const Road = require('./road')
const Point = require('./point')
let myApp = angular.module('myApp', [])

let lastMouse = {
  x: -1,
  y: -1
}

myApp.controller('display', ['$scope', '$interval', function($s, $interval) {
  document.onmousemove = (event) => {
    lastMouse.x = event.pageX
    lastMouse.y = event.pageY
  }
  
  $s.d = new Mindrawing()
  $s.d.setup('display')
  let rect = $s.d.c.parentNode.getBoundingClientRect()
  $s.d.setCanvasSize(rect.width, rect.height)
  $s.d.background('black')
  
  $s.car = new Vehicle($s.d.width / 2, $s.d.height / 2)
  let road1 = new Road(new Point(100, 100), new Point(500, 100))
  $s.car.addWaypoint(road1.start)
  $s.car.addWaypoint(road1.finish)
  $s.car.addWaypoint(new Point($s.car.pos.x, $s.car.pos.y))

  $interval(() => {
    $s.car.tick()
    
    $s.d.background('green')
    road1.draw($s.d)
    $s.car.draw($s.d)
  }, 1/ 30)
}])