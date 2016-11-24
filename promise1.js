var PEDDING = 0;
var FULLFILLED = 1;
var REJECTED = 2;
function Promise(fn) {
  var state = PEDDING;
  var value = null;
  var handlers = [];

  function fullfill(result) {
    state = FULLFILLED;
    value = result;
  }

  function reject(error) {
    state = REJECTED;
    value = error;
  }

  function resolve(result) {
    try{
      var then = getThen(result);
      if(then) {
        doResolve(then.bind(result), resolve, reject);
        return;
      }
      fullfill(result);
    } catch(e) {
      reject(e);
    }
  }

  function getThen(value) {
    var t = typeof value;
    if(value && (t === 'object' || t === 'function')) {
      var then = value.then;
      if(typeof then === 'function') {
        return then;
      }
    }
    return null;
  }

  function doResolve(fn, onFullfilled, onRejected) {
    var done = false;
    try {
      fn(function(value) {
        if(done) return;
        done = true;
        onFullfilled(value);
      }, function(reason) {
        if(done) return;
        done = true;
        onRejected(reason);
      });
    } catch(ex) {
      if(done) return;
      done = true;
      onRejected(ex);
    }
  }
  doResolve(fn, resolve, reject);

  function handle(handler) {
    if(state === PEDDING) {
      handlers.push(handler);
    } else {
      if (state == FULLFILLED && typeof handler.onFulldilled === 'function') {
        handler.onFulldilled(value);
      }
      if(state === REJECTED && typeof handler.onRejected === 'function') {
        handler.onRejected(value);
      }
    }
  }

  this.done = function (onFulfilled, onRejected) {
    // ensure we are always asynchronous
    setTimeout(function () {
      handle({
        onFulfilled: onFulfilled,
        onRejected: onRejected
      });
    }, 0);
  }

  this.then = function(onFullfilled, onRejected) {
    var self = this;
    return new Promise(function(resolve, reject) {
      return self.done(function(result) {
        if(typeof onFullfilled === 'function') {
          try{
            return resolve(onFullfilled(result));
          } catch(ex) {
            return reject(ex);
          }
        } else {
          return resolve(result);
        }
      }, function(error) {
        if(typeof onRejected === 'function') {
          try{
            return resolve(onRejected(result));
          } catch(ex) {
            return reject(ex);
          }
        } else {
          return reject(result);
        }
      })
    });
  }
}


new Promise(function(fullfill, reject) {
  setTimeout(function(){
    console.log("1");
    return 2;
  },3000)
}).then(function(result){
  console.log(result);
}, function(err) {
  console.log(err);
});


console.log("ok");
