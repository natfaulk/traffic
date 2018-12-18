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
  
  // let road1 = new Road(new Point(100, 100), new Point(500, 100))
  $s.cars = []
  $s.roads = []
  $s.roads.push(new Road(new Point(100, 100), new Point(500, 100)))
  $s.roads.push(new Road(new Point(500, 100), new Point(300, 300)))


  for (let i = 0; i < 10; i++) {
    let tempCar = new Vehicle(Math.random() * $s.d.width, Math.random() * $s.d.height)
    tempCar.addWaypoint($s.roads[0].start)
    tempCar.addWaypoint($s.roads[0].finish)
    tempCar.addWaypoint($s.roads[1].finish)
    tempCar.addWaypoint(new Point(tempCar.pos.x, tempCar.pos.y))
    $s.cars.push(tempCar)
  }
  
  $interval(() => {
    $s.cars.forEach(car => {
      car.tick()
    })
    
    $s.d.background('green')
    
    $s.roads.forEach(road => {
      road.draw($s.d)
    })
    $s.cars.forEach(car => {
      car.draw($s.d)
    })
  }, 1/ 30)
}])