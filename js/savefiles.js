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
        let vehicles = []
        let d = JSON.parse(data)
        d.roads.forEach(road => {
          roads.push(new Road(road.start, road.finish, road.lanes))
        })
        let maxUid = 0
        d.routingObjects.forEach(obj => {
          let tempObj = new Routing[obj.type](obj.pos.x, obj.pos.y, obj.intervalTime, vehicles)
          tempObj.uid = obj.uid
          tempObj.children = obj.children
          // in case uid goes higher than current
          if (obj.uid > maxUid) maxUid = obj.uid
          // tempObj._children = []
          // obj.children.forEach(c => {
          //   tempObj._children.push(c.uid)
          // })
          rObjs.push(tempObj)
        })
        Routing.setUID(maxUid + 1)

        // sort out children
        // rObjs.forEach(robj => {
        //   robj._children.forEach(c_uid => {
        //     d.routingObjects.forEach(robj_in => {
        //       if (robj_in.uid == c_uid) robj.children.push(robj_in)
        //     })
        //   })
        //   robj._children = undefined
        // })

        _callback(roads, rObjs, vehicles)
      }
    })
  }
}