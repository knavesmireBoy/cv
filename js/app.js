/*jslint nomen: true */
/*global window: false */
/*global document: false */
(function (slice) {
	"use strict";

	function dummy() {}

	function parallelInvoke(funs, vals) {
		return funs.map(function (f, i) {
			return f(vals[i]);
		});
	}

	function dopartial(defer) {
		return function _partial(f) {
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
				return _partial.apply(null, [f].concat(args, _args));
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

	function curry4(fun) {
		return function (d) {
			return function (c) {
				return function (b) {
					return function (a) {
						return fun(a, b, c, d);
					};
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
			if (!o) {
				return def;
			} //zero etc..
			return notUNDEF(p) ? o[p] : o;
		};
	}

	function invokePropFactory(def) {
		return function (o, p, v) {
			if (!o) {
				return def;
			} //zero etc..
			return notUNDEF(p) ? o[p](v) : def;
		};
	}
    var main = document.querySelector('main'),
		him = document.querySelector('.him'),
		conz = function (x) { window.console.log(x); return x; },
		deferpartial = dopartial(true),
		partial = dopartial(),
        getBest = function (flag) {
            var best = function (pred, actions) {
                return actions.reduce(function (champ, contender) {
					champ = pred() ? champ : contender;
					return champ;
				});
			},
                bestOne = function (pred, actions, arg) {
                    return actions.reduce(function (champ, contender) {
                        champ = pred(arg) ? partial(champ, arg) : partial(contender, arg);
                        return champ;
                    });
                };
            return flag ? bestOne : best;
        },
		best = getBest(),
		bestOne = getBest(true),
		invoke = function (f, arg) {
			return f(arg);
		},
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
		applyProp = function (o, m, p, v) {
			return o[m](p, v);
		},
		getPropBridge = getPropFactory(''),
		invokePropBridge = function (o, p, v) {
			if (o && notUNDEF(p)) {
				return invokeProp(o, p, v);
			}
		},
		setProp = function (o, p, v) {
			o[p] = v;
		},
		setPropBridge = function (o, p, v) {
			if (o && notUNDEF(p)) {
				setProp(o, p, v);
			}
		},
		setPropSort = function (v, o, p) {
			if (o && notUNDEF(p)) {
				setProp(o, p, v);
			}
		},
		applyPropSort = function (v, o, p, m) {
			return applyProp(o, m, p, v);
		},
		add = function (a, b) {
			return a + b;
		},
		doURL = compose(curry2(add)(")"), partial(add, "url(")),
		resetWindow = deferpartial(setPropBridge, window, 'location', '#'),
		notNULL = compose(curry3(invokePropBridge)(/#/)('match'), deferpartial(getPropBridge, window.location, 'href')),
		doResetWindow = compose(invoke, deferpartial(bestOne, notNULL, [resetWindow, dummy])),
		foreach = curry3(invokePropBridge)(invoke)('forEach'),
		prevent = curry3(invokePropBridge)(null)('preventDefault'),
		doNull = curry3(setPropBridge)(null)('backgroundImage'),
		setPropDefer = partial(setPropBridge),
		getTargetPicStyle = defer(curry2(getPropBridge)('style'))(him),
		doEquals = curry3(equals)(null),
		isLocal = compose(curry2(equals)('slide'), curry2(getPropBridge)('className')),
		matchTargetPic = doEquals(him),
		reSetPic = compose(doNull, getTargetPicStyle),
        getHREF = curry3(invokePropBridge)('href')('getAttribute'),
        getHIMhref = defer(curry3(invokePropBridge)('href')('getAttribute'))(him),
		getSub = curry3(invokePropBridge)(1)('substring'),
		getCurrent = compose(getSub, getHIMhref),
		fromPath = curry3(invokePropBridge)(/\/(\w*?)\./)('match'),
		fromHash = curry3(invokePropBridge)(/^#(\w+)/)('match'),
		getData = compose(curry2(getPropBridge)(1), invoke, deferpartial(bestOne, fromPath, [fromPath, fromHash])),
		doBg = compose(curry2(invoke)('backgroundImage'), setPropDefer, getTargetPicStyle)(),
		setHREF = curry4(applyPropSort)('setAttribute')('href'),
		setPicHref = partial(applyProp, him, 'setAttribute', 'href'),
		fromDataSet = compose(setPicHref, partial(add, '#'), curry2(getPropBridge)(1), fromPath, getHREF),
		deferURL = compose(doURL, getHREF),
		deferType = compose(getData, getHREF),
		setPic = compose(doBg, deferURL),
		//deal with .slide elements
		listen = function (tgt) {
			var enter = defer(foreach)([defer(setPic)(tgt), defer(fromDataSet)(tgt), doResetWindow]);
			best(deferpartial(equals, getCurrent(), deferType(tgt)), [reSetPic, enter])();
			deferScroll();
		},
		//deal with pic, external links
		listenBridge = function (e) {
            best(defer(matchTargetPic)(e.target), [reSetPic, dummy])();
			compose(invoke, deferpartial(best, defer(isLocal)(e.target), [compose(defer(prevent)(e), defer(listen)(e.target)), dummy]))();
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