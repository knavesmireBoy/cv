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
	var main = document.querySelector('main'),
		him = document.querySelector('.him'),
		//con = function (x){ console.log(x); return x; },
		deferpartial = dopartial(true),
		partial = dopartial(),
		drill = function (o, p) {
			o = o[p];
			return o;
		},
		best = function (pred, actions) {
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
		},
		always = function (x) {
			return function () {
				return x;
			};
		},
        identity = function(x){
            return x;
        },
		negate = function (prd) {
			return !prd;
		},
		gtEq = function (a, b) {
			return a >= b;
		},
		notNeg = curry2(gtEq)(0),
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
		getProp = function (o, p) {
			return p ? o[p] : o;
		},
		invokeProp = function (o, p, v) {
			return o[p](v);
		},
		applyProp = function (o, m, p, v) {
			return o[m](p, v);
		},
		setProp = function (o, p, v) {
			o[p] = v;
		},
		setPropBridge = function (v, o, p) {
			o[p] = v;
		},
		applyPropBridge = function (v, o, p, m) {
			return applyProp(o, m, p, v);
		},
		doURL = function (src) {
			return "url(" + src + ")";
		},
		add = function (a, b) {
			return a + b;
		},
		notExternal = function (tgt) {
			var hash = window.location.href.indexOf('#'),
				own = tgt.href.indexOf(window.location.href);
			return [hash, own].some(notNeg);
		},
		resetWindow = deferpartial(setProp, window, 'location', '#'),
		foreach = curry3(invokeProp)(invoke)('forEach'),
		prevent = curry3(invokeProp)(null)('preventDefault'),
		doNull = curry3(setProp)(null)('backgroundImage'),
		setPropDefer = partial(setProp),
		getTargetPicStyle = defer(curry2(getProp)('style'))(him),
		getDataSet = defer(curry2(getProp)('dataset'))(him),
		doEquals = curry3(equals)(null),
		getTarget = curry2(getProp)('target'),
		isTargetPic = doEquals(him),
		getNodeName = curry2(getProp)('nodeName'),
		isLink = compose(doEquals('A'), getNodeName, getTarget),
		isLocal = compose(notExternal, getTarget),
		notPic = compose(negate, isTargetPic, getTarget),
		reSetPic = compose(doNull, getTargetPicStyle),
		getCurrent = deferpartial(invokeProp, [him, 'dataset', 'current'], 'reduce', drill),
		/*IF not empty match string after / AND before .; 
		so an array is expected and we need the first captured group which is at index 1;
        fallback is [null, '']
		*/
		getData = compose(curry2(getProp)(1), invoke, deferpartial(bestOne, identity, [curry3(invokeProp)(/\/(\w*?)\./)('match'), always('')])),
		setAssets = curryLeft(add)("assets/"),
		doBg = compose(curry2(invoke)('backgroundImage'), setPropDefer, getTargetPicStyle)(),
		doDataSet = compose(curry2(invoke)('current'), setPropDefer, getDataSet)(),
		getHREF = curry3(invokeProp)('href')('getAttribute'),
		setHREF = curry4(applyPropBridge)('setAttribute')('href'),
		setPicHref = partial(applyProp, him, 'setAttribute', 'href'),
		fromDataSet = compose(setPicHref, partial(add, '#'), deferpartial(invokeProp, him, 'getAttribute', 'data-current')),
		deferURL = compose(doURL, getHREF, getTarget),
		deferType = compose(getData, getHREF, getTarget),
		setPic = compose(doBg, deferURL),
		doDataRESET = defer(doDataSet)(''),
		validatePic = compose(isTargetPic, getTarget),
		reset_actions = [compose(reSetPic, getTarget), compose(doDataRESET, getTarget)];
	main.addEventListener('click', function (e) {
		var validate = defer(curry3(invokeProp)(curry2(invoke)(e))('every'))([isLink, isLocal, notPic]),
			resetWhen = deferpartial(invokeProp, reset_actions, 'map', curry2(invoke)(e)),
			resetPic = best(defer(validatePic)(e), [resetWhen, dummy]),
			preventer = compose(invoke, deferpartial(best, validate, [defer(prevent)(e), dummy])),
			enter = defer(foreach)([defer(setPic)(e), defer(doDataSet)(deferType(e)), fromDataSet, resetWindow]),
			restore = defer(foreach)([reSetPic, doDataRESET]),
			match = deferpartial(equals, getCurrent(), deferType(e)),
			thenInvoke = compose(invoke, deferpartial(best, match, [restore, enter])),
			doSetPic = compose(invoke, deferpartial(best, validate, [defer(foreach)([thenInvoke, deferScroll]), dummy]));
		preventer();
		doSetPic();
		resetPic();
	});
	window.addEventListener('load', function () {
		var links = slice.call(document.querySelectorAll('.slide')),
			values = ["minding.jpg", "alderley.jpg", "bolt.jpeg", "frank.jpg"],
			getId = compose(getData, getHREF),
			setId = curry3(setPropBridge)('id'),
			ptl;
		values = values.map(setAssets);
		ptl = links.map(setHREF);
		parallelInvoke(ptl, values);
		ptl = links.map(setId);
		values = links.map(getId);
		parallelInvoke(ptl, values);
	});
}(Array.prototype.slice));