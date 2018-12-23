const Mindrawing = require('mindrawingjs')
const Vehicle = require('./vehicle')
const Road = require('./road')
const Point = require('./point')
let myApp = angular.module('myApp', [])
const Settings = require('./settings')
const Routing = require('./routing')
const Savefiles = require('./savefiles')

let lastMouse = {
  x: -1,
  y: -1
}

myApp.controller('display', ['$scope', '$interval', function($s, $interval) {
  document.onmousemove = (event) => {
    lastMouse.x = event.pageX
    lastMouse.y = event.pageY
  }

  $s.settings = {
    showGrid: false,
    numLanes: 2,
    showRouting: true
  }

  $s.tool = {
    type: 'road',
    begin: false,
    pos1: new Point(),
    pos2: new Point()
  }

  Savefiles.init()
  
  $s.d = new Mindrawing()
  $s.d.setup('display')
  let rect = $s.d.c.parentNode.getBoundingClientRect()
  $s.d.setCanvasSize(rect.width, rect.height)
  $s.d.background('black')

  $s.d.c.addEventListener('mouseup', (e) => {
    // console.log(e.x, e.y)
    if ($s.tool.type == 'road') {
      if (!$s.tool.begin) $s.tool.pos1 = new Point(e.x, e.y)
      else {
        $s.tool.pos2 = new Point(e.x, e.y)
        $s.roads.push(new Road($s.tool.pos1, $s.tool.pos2, $s.settings.numLanes))
      }
      $s.tool.begin = !$s.tool.begin
    } else if ($s.tool.type == 'vehicleSource') {
      routingObjs.push(new Routing.VehicleSource(e.x, e.y))
    } else if ($s.tool.type == 'vehicleSink') {
      routingObjs.push(new Routing.VehicleSink(e.x, e.y))
    } else if ($s.tool.type == 'intersection') {
      routingObjs.push(new Routing.Intersection(e.x, e.y))
    }

  })
  
  // let road1 = new Road(new Point(100, 100), new Point(500, 100))
  $s.cars = []
  $s.roads = []
  // $s.roads.push(new Road(new Point(100, 100), new Point(500, 100), 8))
  // $s.roads.push(new Road(new Point(500, 100), new Point(300, 300), 4))


  // for (let i = 0; i < 10; i++) {
  //   let tempCar = new Vehicle(Math.random() * $s.d.width, Math.random() * $s.d.height)
  //   tempCar.addWaypoint($s.roads[0].start)
  //   tempCar.addWaypoint($s.roads[0].finish)
  //   tempCar.addWaypoint($s.roads[1].finish)
  //   tempCar.addWaypoint(new Point(tempCar.pos.x, tempCar.pos.y))
  //   $s.cars.push(tempCar)
  // }

  let routingObjs = []
  // routingObjs.push(new Routing.VehicleSource(100, 100))
  // routingObjs.push(new Routing.VehicleSink(500, 500))
  // routingObjs.push(new Routing.VehicleSink(400, 500))
  // routingObjs.push(new Routing.Intersection(300, 300))
  
  $interval(() => {
    $s.cars.forEach(car => {
      car.tick()
    })
    
    $s.d.background('green')

    if ($s.settings.showGrid) {
      $s.d.stroke('white')
      $s.d.strokeWeight(1)      
      for (let i = 0; i < $s.d.width; i += Settings.GRID_SIZE) {
        $s.d.line(i, 0, i, $s.d.height)
      }
      for (let i = 0; i < $s.d.height; i += Settings.GRID_SIZE) {
        $s.d.line(0, i, $s.d.height, i)
      }
    }
    
    $s.roads.forEach(road => {
      road.draw($s.d)
    })
    $s.cars.forEach(car => {
      car.draw($s.d)
    })

    if ($s.settings.showRouting) {
      routingObjs.forEach(ro => {
        ro.draw($s.d)
      })
    }

    if ($s.tool.begin) $s.d.line($s.tool.pos1.x, $s.tool.pos1.y, lastMouse.x, lastMouse.y)
  }, 1/ 30)

  $s.save = () => {
    Savefiles.save('test.json', $s.roads, routingObjs)
  }

  $s.load = () => {
    Savefiles.load('test.json', (_roads, _robjs) => {
      console.log('Loaded')
      $s.roads = _roads
      routingObjs = _robjs
    })
  }
}])