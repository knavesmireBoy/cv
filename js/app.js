/*jslint nomen: true */
/*global window: false */
/*global document: false */
/*global toString: false */
(function (slice) {
	"use strict";

	function dummy() {}

	function parallelInvoke(funs, vals) {
		return funs.map(function (f, i) {
			return f(vals[i]);
		});
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
	//let compose = (...fns) => fns.reduce( (f, g) => (...args) => f(g(...args)))
	///(?<=\/)(.*?)(?=\.)/
	function compose() {
		var fns = slice.call(arguments);
		return fns.reduce(function (f, g) {
			return function () {
				return f(g.apply(null, arguments));
			};
		});
	}

	function getPropFactory(def) {
		return function (o, p) {
			if (!notUNDEF(o)) {
				return def;
			} //zero etc..
			return notUNDEF(p) && notUNDEF(o[p]) ? o[p] : o;
		};
	}

	function tagTester(name) {
		var tag = '[object ' + name + ']';
		return function (obj) {
			return toString.call(obj) === tag;
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
	var main = document.querySelector('main'),
		him = document.querySelector('.him'),
		conz = function (x) { window.console.log(x); return x; },
		deferPTL = dopartial(true),
		ptL = dopartial(),
		isArray = tagTester('Array'),
        invoke = function (f, v) {
            var m = isArray(v) ? 'apply' : 'call';
            return f[m](f, v);
        },
		getBest = function (flag) {
			var best = function (pred, actions) {
					return actions.reduce(function (champ, contender) {
						champ = pred() ? champ : contender;
						return champ;
					});
				},
                bestOne = function (pred, actions, arg) {
                    actions = actions.map(curry2(invoke)(arg));
					return actions.reduce(function (champ, contender) {
						champ = pred(arg) ? champ : contender;
						return champ;
					});
				};
			return flag ? bestOne : best;
		},
		best = getBest(),
		bestOne = getBest(true),
		doScroll = function () {
			document.body.scrollTop = 0; // For Safari
			document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
		},
		deferScroll = function () {
			window.setTimeout(doScroll, 444);
		},
		equals = function (a, b) {
			return a === b;
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
		setProp = function (o, p, v) {
			o[p] = v;
		},
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
		add = function (a, b) {
			return a + b;
		},
		doURL = compose(curry2(add)(")"), ptL(add, "url(")),
        each = curry3(invokeProp)(invoke)('forEach'),
        lazyEach = curry3(lazyVal)('forEach'),
        getSub = curry3(invokeProp)(1)('substring'),
		mytarget = !window.addEventListener ? 'srcElement' : 'target',
		getTarget = curry2(getPropBridge)(mytarget),
		getID = curry2(getPropBridge)('id'),
        resetPicHref = deferPTL(invokeProp, him, 'setAttribute', ['href', '#']),
		resetWindow = deferPTL(setPropBridge, window.location, 'hash', '#'),
        getHIMhref = defer(curry3(invokeProp)('href')('getAttribute'))(him),
        getCurrent = compose(getSub, getHIMhref),
        getHash = ptL(getPropBridge, window.location),
        reEntry = compose(resetWindow, resetPicHref),
        lazyMap = defer(curry3(lazyVal)('map')([getHIMhref, getHash]))(curry2(invoke)('hash')),
        eek = function(){
            best(compose(ptL(invoke, equals), lazyMap), [reEntry, dummy])();
        },
        equality = compose(invoke, deferPTL(best, compose(ptL(invoke, equals), lazyMap), [reEntry, dummy])),
		//doResetWindow = ptL(bestOne, getHash, [resetWindow, dummy]),
		prevent = curry3(invokeProp)(null)('preventDefault'),
		doNull = curry3(setPropBridge)(null)('backgroundImage'),
		setPropDefer = ptL(setPropBridge),
		getTargetPicStyle = defer(curry2(getPropBridge)('style'))(him),
		doEquals = curry3(equals)(null),
		isLocal = compose(curry2(equals)('slide'), curry2(getPropBridge)('className')),
		matchTargetPic = doEquals(him),
		reSetPic = compose(doNull, getTargetPicStyle),
		getHREF = curry3(invokeProp)('href')('getAttribute'),
		fromPath = curry3(invokeProp)(/\/(\w*?)\./)('match'),
		fromHash = curry3(invokeProp)(/^#(\w+)/)('match'),
		getData = compose(curry2(getPropBridge)(1), invoke, deferPTL(bestOne, fromPath, [fromPath, fromHash])),
		doBg = compose(curry2(invoke)('backgroundImage'), setPropDefer, getTargetPicStyle)(),
		doHREF = curry2(doPair)('href'),
		setHREF = curry3(lazyVal)('setAttribute;href'),
		setPicHref = compose(ptL(invokeProp, him, 'setAttribute'), doHREF),
		
		fromDataSet = compose(setPicHref, ptL(add, '#'), curry2(getPropBridge)(1), fromPath, getHREF),
		deferURL = compose(doURL, getHREF),
		setPic = compose(doBg, deferURL),
		matchPic = compose(matchTargetPic, getTarget),
		matchLocal = compose(isLocal, getTarget),
		//deal with .slide elements
		listen = function (tgt) {
            //doResetWindow('hash');
            equality();
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
		};
	main.addEventListener('click', listenBridge);
	window.addEventListener('DOMContentLoaded', function () {
		/*only add links if JS enabled*/
		var links = slice.call(document.querySelectorAll('.slide')),
			values = ["minding.jpg", "alderley.jpg", "bolt.jpeg", "frank.jpg"],
			getId = compose(getData, getHREF),
			setId = curry3(setPropSort)('id'),
			ptl;
		values = values.map(curryLeft(add)("assets/"));
		ptl = links.map(setHREF);
		parallelInvoke(ptl, values);
		ptl = links.map(setId);
		values = links.map(getId);
		parallelInvoke(ptl, values);
	});
}(Array.prototype.slice));