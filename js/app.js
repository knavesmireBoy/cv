/*jslint nomen: true */
/*global window: false */
/*global document: false */
/*global toString: false */
(function (slice, query) {
	"use strict";
	//https://stackoverflow.com/questions/27078285/simple-throttle-in-javascript
	// Returns a function, that, when invoked, will only be triggered at most once
	// during a given window of time. Normally, the throttled function will run
	// as much as it can, without ever going more than once per `wait` duration;
	// but if you'd like to disable the execution on the leading edge, pass
	// `{leading: false}`. To disable execution on the trailing edge, ditto.
    
    function throttle(func, wait, options) {
        var later,
            context,
            args,
            result,
            timeout = null,
            previous = 0;
        options = options || {};
        later = function () {
            previous = options.leading === false ? 0 : Date.now();
            timeout = null;
            result = func.apply(context, args);
			if (!timeout) {
                context = args = null;
            }
		};
		return function () {
			var now = Date.now(),
                remaining;
			if (!previous && options.leading === false) {
                previous = now;
            }
            remaining = wait - (now - previous);
			context = this;
			args = arguments;
            if (remaining <= 0 || remaining > wait) {
                if (timeout) {
                    window.clearTimeout(timeout);
					timeout = null;
                }
                previous = now;
				result = func.apply(context, args);
                if (!timeout) {
                    context = args = null;
                }
            } else if (!timeout && options.trailing !== false) {
                timeout = window.setTimeout(later, remaining);
            }
            return result;
        };
    }

	function dummy() {}
    
    function equals(a, b) {
        return a === b;
    }
    function add(a, b) {
        return a + b;
    }
    
    function always(x) {
        return function () {
            return x;
        };
    }

	function tagTester(name) {
		var tag = '[object ' + name + ']';
		return function (obj) {
			return toString.call(obj) === tag;
		};
	}

	function negate(f) {
		return function () {
			return !f();
		};
	}
    
	function doPair(v, p) {
		return [p, v];
	}

	function dopartial(defer) {
		return function _ptL(f) {
			var args = slice.call(arguments, 1);
			/*be careful if function is a callback to an array method as
			a: the arg count may exceed the function count
			b: and will include wrong arguments (ie index and array expected in such callbacks), FIX with curry
			*/
			if (args.length === f.length) {
				if (defer) {
					return function () {
						return f.apply(null, args);
					};
				}
				return f.apply(null, args);
			}
			return function () {
				var _args = slice.call(arguments);
				return _ptL.apply(null, [f].concat(args, _args));
			};
		};
	}

	function notUNDEF(arg) {
		return typeof (arg) !== 'undefined';
	}

	function defer(fun) {
		return function (a) {
			return function () {
				return fun(a);
			};
		};
	}

	function curryLeft(fun) {
		return function (a) {
			return function (b) {
				return fun(a, b);
			};
		};
	}

	function curry2(fun) {
		return function (b) {
			return function (a) {
				return fun(a, b);
			};
		};
	}

	function curry3(fun) {
		return function (c) {
			return function (b) {
				return function (a) {
					return fun(a, b, c);
				};
			};
		};
	}

	function compose() {
		var fns = slice.call(arguments);
		return fns.reduce(function (f, g) {
			return function () {
				return f(g.apply(null, arguments));
			};
		});
	}
    function setProp(o, p, v) {
        o[p] = v;
    }

	function getPropFactory(def) {
		return function (o, p) {
			if (!notUNDEF(o)) {
				return def;
			} //zero etc..
			return notUNDEF(p) && notUNDEF(o[p]) ? o[p] : o;
		};
	}

	function invokePropFactory(def) {
		var isArray = tagTester('Array');
		return function (o, p, v) {
			if (!o) {
				return def;
			} //zero etc..
			var m = isArray(v) ? 'apply' : 'call';
			if (notUNDEF(p) && notUNDEF(o[p])) {
				return o[p][m](o, v);
			}
			return o;
		};
	}

	function parallelInvoke(funs, vals) {
		return funs.map(function (f, i) {
			return f(vals[i]);
		});
	}

	function best(pred, actions) {
		return actions.reduce(function (champ, contender) {
			champ = pred() ? champ : contender;
			return champ;
		});
	}
	var main = document.querySelector('main'),
		him = document.querySelector('.him'),
		links = slice.call(document.querySelectorAll('.slide')),
		/*conz = function (x) {
			window.console.log(x);
			return x;
		},*/
		deferPTL = dopartial(true),
		ptL = dopartial(),
		isArray = tagTester('Array'),
		invoke = function (f, v) {
			var m = isArray(v) ? 'apply' : 'call';
			return f[m](f, v);
		},
		doScroll = function () {
			document.body.scrollTop = 0; // For Safari
			document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
		},
		deferScroll = function () {
			window.setTimeout(doScroll, 500);
		},
		invokeProp = invokePropFactory(''),
		lazy = function (sep) {
			return function (v, o, p) {
				var x = p.split(sep),
					pp = x[1];
				//known method and property supplied as one string ie 'setAttribute;href' args to setAttribute supplied as array
				if (pp) {
					v = [pp, v];
					p = x[0];
				}
				return invokeProp(o, p, v);
			};
		},
		lazyVal = lazy(';'),
		getPropBridge = getPropFactory(''),
		setPropBridge = function (o, p, v) {
			if (o && notUNDEF(p) && notUNDEF(o[p])) {
				setProp(o, p, v);
			}
		},
		setPropSort = function (v, o, p) {
			if (o && notUNDEF(p)) {
				setProp(o, p, v);
			}
		},
		doAlternate = function (j) {
			function alternate(i, n) {
				return function () {
					i = (i += 1) % n;
					return i;
				};
			}
			return function (actions) {
				j = j || 2;
				return compose(invoke, deferPTL(best, alternate(0, j), actions));
			};
		},
		doAlt = doAlternate(),
        doURL = compose(curry2(add)(")"), ptL(add, "url(")),
		each = curry3(invokeProp)(invoke)('forEach'),
		lazyEach = curry3(lazyVal)('forEach'),
		getSub = curry3(invokeProp)(1)('substring'),
		mytarget = !window.addEventListener ? 'srcElement' : 'target', //IF we get around to supporting senior browsers
		getTarget = curry2(getPropBridge)(mytarget),
		getID = curry2(getPropBridge)('id'),
		resetPicHref = deferPTL(invokeProp, him, 'setAttribute', ['href', '#']),
		resetWindow = deferPTL(setPropBridge, window.location, 'hash', '#'),
		getHIMhref = defer(curry3(invokeProp)('href')('getAttribute'))(him),
		getCurrent = compose(getSub, getHIMhref),
		getHash = ptL(getPropBridge, window.location),
		reEntry = compose(resetWindow, resetPicHref),
		queryHash = defer(curry3(lazyVal)('map')([getHIMhref, getHash]))(curry2(invoke)('hash')),
		/*get window location and active internal link on him pic, if equal reset both to empty, mapped results supplied as array to invoke. Wasted time having location.hash in a closure needs to be read live. Must run prior to checking which link was clicked. Effectively reloads page*/
		doReload = compose(invoke, deferPTL(best, compose(ptL(invoke, equals), queryHash), [reEntry, dummy])),
		prevent = curry3(invokeProp)(null)('preventDefault'),
		//resets inline style
		doNull = curry3(setPropBridge)(null)('backgroundImage'),
		setPropDefer = ptL(setPropBridge),
		getTargetPicStyle = defer(curry2(getPropBridge)('style'))(him),
		isLocal = compose(curry2(equals)('slide'), curry2(getPropBridge)('className')),
		reSetPic = compose(doNull, getTargetPicStyle),
		getHREF = curry3(invokeProp)('href')('getAttribute'),
		fromPath = curry3(invokeProp)(/\/(\w*?)\./)('match'),
		doBg = compose(curry2(invoke)('backgroundImage'), setPropDefer, getTargetPicStyle)(),
		setPicHref = compose(ptL(invokeProp, him, 'setAttribute'), curry2(doPair)('href')),
		fromDataSet = compose(setPicHref, ptL(add, '#'), curry2(getPropBridge)(1), fromPath, getHREF),
		setPic = compose(doBg, doURL, getHREF),
		matchPic = compose(curry3(equals)(null)(him), getTarget),
		matchLocal = compose(isLocal, getTarget),
		//deal with .slide elements
		listen = function (tgt) {
			doReload();
			var enter = defer(each)([defer(setPic)(tgt), defer(fromDataSet)(tgt)]);
			best(deferPTL(equals, getCurrent(), getID(tgt)), [compose(resetPicHref, reSetPic), enter])();
			deferScroll();
		},
		//deal with pic, external links
		listenBridge = function (e) {
			var cb = curry2(invoke)(e),
				enter = defer(lazyEach([compose(listen, defer(getTarget)(e)), prevent]))(cb);
			best(defer(matchPic)(e), [reSetPic, dummy])();
			compose(invoke, deferPTL(best, defer(matchLocal)(e), [enter, dummy]))();
		},
		loader = function () {
			var setHREF = curry3(lazyVal)('setAttribute;href'),
				values = ["minding.jpg", "alderley.jpg", "bolt.jpeg", "frank.jpg"],
				getId = compose(curry2(getPropBridge)(1), fromPath, getHREF),
				setId = curry3(setPropSort)('id'),
				ptl;
			values = values.map(curryLeft(add)("assets/"));
			ptl = links.map(setHREF);
			parallelInvoke(ptl, values);
			ptl = links.map(setId);
			values = links.map(getId);
			parallelInvoke(ptl, values);
            main.addEventListener('click', listenBridge);
		},
		undo = function () {
			links.forEach(function (el) {
				el.removeAttribute('href');
			});
			main.removeEventListener('click', listenBridge);
		},
		getPredicate = compose(curry2(getPropBridge)('matches'), defer(curry3(invokeProp)(query)('matchMedia'))(window)),
		setup = function () {
			var doReverse = ptL(lazyVal, null, [loader, undo]),
				strategy = compose(doAlt, doReverse, invoke, deferPTL(best, getPredicate, [always('slice'), always('reverse')]))(),
                doStrategy = compose(invoke, deferPTL(best, getPredicate, [strategy, dummy])),
				handler = function () {
					if (!getPredicate()) {
						strategy();
						getPredicate = negate(getPredicate);
					}
				};
			window.addEventListener('resize', throttle(handler, 66));
			doStrategy();
		};
	window.addEventListener('DOMContentLoaded', setup);
}(Array.prototype.slice, "(min-width: 769px)"));
//let compose = (...fns) => fns.reduce( (f, g) => (...args) => f(g(...args)))
///look back (?<=\/)(.*?)(?=\.)/