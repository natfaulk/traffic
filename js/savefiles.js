const fs = require('fs')
const path = require('path')
const Road = require('./road')
const Routing = require('./routing')

function mkdir_p(_dir) {
  console.log(_dir)
  if (!fs.existsSync(_dir)) {
    fs.mkdirSync(_dir)
  }
}

module.exports = {
  init: () => {
    mkdir_p(path.join(__dirname, '..', 'saves'))
  },
  save: (_fn, _roads, _routObjs) => {
    let out = {
      roads: _roads,
      routingObjects: _routObjs
    }
    out.routingObjects.forEach(robj => {
      robj.type = robj.__proto__.constructor.name
    })
    // console.log(out)
    fs.writeFile(path.join(__dirname, '..', 'saves', _fn), JSON.stringify(out), err => {
      if (err) console.log('error saving file')
      else console.log('file saved')
    })
  },
  load: (_fn, _callback) => {
    fs.readFile(path.join(__dirname, '..', 'saves', _fn), (err, data) => {
      if (err) console.log('Error loading file')
      else {
        let roads = []
        let rObjs = []
        let d = JSON.parse(data)
        d.roads.forEach(road => {
          roads.push(new Road(road.start, road.finish, road.lanes))
        })
        d.routingObjects.forEach(obj => {
          rObjs.push(new Routing[obj.type](obj.pos.x, obj.pos.y))
        })

        _callback(roads, rObjs)
      }
    })
  }
}