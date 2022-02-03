/*jslint nomen: true */
/*global window: false */
/*global document: false */
(function() {
	"use strict";
    
    function slice(){
        return Array.prototype.slice;
    }
    
    function dummy(){}
    
    function always(arg){
        return function(){
            return arg;
        };
    }
    
    function dopartial(defer){
        return function _partial(f){
            var args = slice().call(arguments, 1);

            if(f.length === args.length){
                if(defer){
                    return function(){
                      return f.apply(null, args);  
                    };
                }
                return f.apply(null, args);
            }
        return function(){
            var _args = slice().call(arguments);
            return _partial.apply(null, [f].concat(args, _args));
        };
    };
}

	function defer(fun) {
		return function(a) {
			return function() {
				return fun(a);
			};
		};
	}
    
	function curry2(fun) {
		return function(b) {
			return function(a) {
				return fun(a, b);
			};
		};
	}

	function curry22(fun) {
		return function(b) {
			return function(a) {
				return function() {
					return fun(a, b);
				};
			};
		};
	}

	function curry3(fun) {
		return function(c) {
			return function(b) {
				return function(a) {
					return fun(a, b, c);
				};
			};
		};
	}

	function curry33(fun) {
		return function(c) {
			return function(b) {
				return function(a) {
					return function() {
						return fun(a, b, c);
					};
				};
			};
		};
	}

	function curryLeft(fun) {
		return function(a) {
			return function(b) {
				return function(c) {
					return fun(a, b, c);
				};
			};
		};
	}
    /*
    function isArray(obj) {
        return Array.isArray ? Array.isArray(obj) : Object.prototype.toString.call(obj) === '[object Array]' 
    }
    
    function fncall(arg){
        return isArray(arg) ? 'apply' : 'call';
    }

	function compCB(v, f) {
		var m = fncall(v);
		return f[m](null, v);
	}

	function comp(fns) {
		return fns.reduce(compCB, [].slice.call(arguments, 1));
	}
    */
    //https://medium.com/@dtipson/creating-an-es6ish-compose-in-javascript-ac580b95104a
	//let compose = (...fns) => fns.reduce( (f, g) => (...args) => f(g(...args)))
	function compose(fns) {
		return fns.reduce(function(f, g) {
			return function() {
				return f(g.apply(null, arguments));
			};
		});
	}
    /*
	function add(a, b) {
		return a + b;
	}

	function mult(a, b) {
		return a * b;
	}

	function div(a, b) {
		return a / b;
	}
  */
	function con(arg) {
		console.log(arg);
		return arg;
	}
  
	var main = document.querySelector('main'),
		him = document.querySelector('.him'),
        deferpartial = dopartial(true),
        partial = dopartial(),
		drill = function(o, p) {
			o = o[p];
			return o;
		},
		best = function(pred, actions) {
			return actions.reduce(function(champ, contender) {
				champ = pred() ? champ : contender;
				return champ;
			});
		},
		invoke = function(f, arg) {
			return f(arg);
		},
		doScroll = function() {
			document.body.scrollTop = 0; // For Safari
			document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
		},
		deferScroll = function() {
			window.setTimeout(doScroll, 444);
		},
		notExternal = function(tgt) {
			return tgt.href.indexOf(window.location.href) >= 0;
		},
		equals = function(a, b) {
			return a === b;
		},
		getProp = function(o, p) {
			return p ? o[p] : o;
		},
		invokeProp = function(o, p, v) {
			return o[p](v);
		},
		setProp = function(o, p, v) {
            o[p] = v;
		},
		doURL = function(src) {
			return "url(" + src + ")";
		},
		each = curry33(invokeProp)(invoke)('forEach'),
		prevent = curry33(invokeProp)(null)('preventDefault'),
		doNull = curry3(setProp)(null)('backgroundImage'),
		setPropDefer = partial(setProp),
		getTargetPicStyle = curry22(getProp)('style')(him),
		getDataSet = curry22(getProp)('dataset')(him),
		doEquals = curry3(equals)(null),
		getTarget = curry2(getProp)('target'),
		isTargetPic = doEquals(him),
		getNodeName = curry2(getProp)('nodeName'),
		isLink = compose([doEquals('A'), getNodeName, getTarget]),
		isLocal = compose([notExternal, getTarget]),
		reSetPic = compose([doNull, getTargetPicStyle]),
		getCurrent = deferpartial(invokeProp, [him, 'dataset', 'current'], 'reduce', drill),
		getData = function(str) {
			if (!str) {
				return '';
			}
			var start = str.lastIndexOf('/'),
				end = str.lastIndexOf('.');
			return str.substring(start + 1, end);
		},
		doBg = compose([curry2(invoke)('backgroundImage'), setPropDefer, getTargetPicStyle])(),
		doDataSet = compose([curry2(invoke)('current'), setPropDefer, getDataSet])(),
		getHREF = curry3(invokeProp)('href')('getAttribute'),
		deferURL = compose([doURL, getHREF, getTarget]),
		deferType = compose([ getData, getHREF, getTarget]),
		setPic = compose([doBg, deferURL]),
		doDataRESET = defer(doDataSet)(''),
        validatePic = compose([isTargetPic, getTarget]),
        reset_actions = [compose([reSetPic, getTarget]), compose([doDataRESET, getTarget])];    
	main.addEventListener('click', function(e) {
		var validate = curry33(invokeProp)(curry2(invoke)(e))('every')([isLink, isLocal]),
            resetWhen = deferpartial(invokeProp, reset_actions, 'map', curry2(invoke)(e)),
            resetPic = best(defer(validatePic)(e), [resetWhen, dummy]),           
            preventer = compose([invoke, deferpartial(best, validate, [prevent(e), dummy]) ]),
			enter = each([defer(setPic)(e), defer(doDataSet)(deferType(e))]),
			restore = each([reSetPic, doDataRESET]),
			match = deferpartial(equals, getCurrent(), deferType(e)),
            thenInvoke = compose([invoke, deferpartial(best, match, [restore, enter])]),
            doSetPic = compose([invoke, deferpartial(best, validate, [each([thenInvoke, deferScroll]), dummy])]);
        con(getCurrent())
		preventer();
        doSetPic();
        resetPic();
	});
}());