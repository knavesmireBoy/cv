/*jslint nomen: true */
/*global window: false */
/*global document: false */
(function() {
	"use strict";
    
    function slice(){
        return Array.prototype.slice;
    }
    
    function dummy(){}
    
    function dopartial(defer){
        return function _partial(f){
            var args = slice().call(arguments, 1);
            if(f.length === args.length){
                if(defer){
                    con(args);
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

	function delay(fun) {
		return function() {
			return function(a) {
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
    
    function curryTwo(fun) {
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
    
    function isArray(obj) {
        return Array.isArray ? Array.isArray(obj) : Object.prototype.toString.call(obj) === '[object Array]' 
    }

	function deferInvoke(f) {
        return function(f){
            return f();
        };
    }
    
    function invokeALL(funs, cb){
        return funs.map(cb);
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
    //https://medium.com/@dtipson/creating-an-es6ish-compose-in-javascript-ac580b95104a
	//let compose = (...fns) => fns.reduce( (f, g) => (...args) => f(g(...args)))
	function nest(fns) {
		return fns.reduce(function(f, g) {
			return function() {
				return f(g.apply(null, arguments));
			};
		});
	}
    
	function add(a, b) {
		return a + b;
	}

	function mult(a, b) {
		return a * b;
	}

	function div(a, b) {
		return a / b;
	}

	function con(arg) {
		console.log(arg);
		return arg;
	}

	function underscore_compose() {
		var args = arguments,
			start = args.length - 1;
		return function() {
			var i = start,
				result = args[start].apply(this, arguments);
			while (i--) {
				result = args[i].call(this, result);
			}
			return result;
		}
	}
    
	var main = document.querySelector('main'),
		him = document.querySelector('.him'),
        partial = dopartial(),
        deferpartial = dopartial(true),
		compose = function(v, f) {
			v = f(v);
			return v;
		},
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
        bestOne = function(pred, actions, arg) {
			return actions.reduce(function(champ, contender) {
				champ = pred(arg) ? defer(champ)(arg) : defer(contender)(arg);
				return champ;
			});
		},
		invoke = function(f, arg) {
			return f(arg);
		},
		doWhen = function(pred, action) {
			return function(arg) {
				if (pred(arg)) {
					return action(arg);
				}
			};
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
		map = curry33(invokeProp)(invoke)('map'),
		prevent = curry33(invokeProp)(null)('preventDefault'),
		doNull = curry3(setProp)(null)('backgroundImage'),
		setPropDefer = curryLeft(setProp),
		getTargetPicStyle = curry22(getProp)('style')(him),
		getDataSet = curry22(getProp)('dataset')(him),
		doEquals = curry3(equals)(null),
		getTarget = curry2(getProp)('target'),
		isTargetPic = doEquals(him),
		getNodeName = curry2(getProp)('nodeName'),
		doReduce = function(cb, grp, ini) {
			return grp.reduce(cb, ini);
		},
		doCompose = curryLeft(doReduce)(compose),
		isLink = doCompose([getTarget, getNodeName, doEquals('A')]),
		isLocal = doCompose([getTarget, notExternal]),
		reSetPic = doCompose([getTargetPicStyle, doNull]),
		getCurrent = defer(curryLeft(doReduce)(drill)(['dataset', 'current']))(him),
		getData = function(str) {
			if (!str) {
				return '';
			}
			var start = str.lastIndexOf('/'),
				end = str.lastIndexOf('.');
			return str.substring(start + 1, end);
		},
		doBg = doReduce(compose, [getTargetPicStyle, setPropDefer])('backgroundImage'),
		doDataSet = doReduce(compose, [getDataSet, setPropDefer])('current'),
		getHREF = curry3(invokeProp)('href')('getAttribute'),
		deferURL = doCompose([getTarget, getHREF, doURL]),
		deferType = doCompose([getTarget, getHREF, getData]),
		setPic = doCompose([deferURL, doBg]),
		doDataRESET = defer(doDataSet)(''),
		doResetData = doCompose([getTarget, doWhen(isTargetPic, doDataRESET)]),
		doResetPic = doCompose([getTarget, doWhen(isTargetPic, reSetPic)]),
        validatePic = nest([isTargetPic, getTarget]),
        //reset_actions = [nest([reSetPic, getTarget]), nest([doDataRESET, getTarget])],
        reset_actions = [nest([reSetPic, getTarget])],
        defer_invoke = curryTwo(invoke);

    
	main.addEventListener('click', function(e) {
		var validate = curry33(invokeProp)(curry2(invoke)(e))('every')([isLink, isLocal]),
            //resetWhen = deferpartial(invokeALL, reset_actions, curry2(invoke)(e)),
            //resetPic = bestOne(validatePic, [prompt, alert]),            
            doReset = deferpartial(invokeProp, [doResetPic, doResetData], 'forEach', curry2(invoke)(e)),
            preventer = nest([invoke, deferpartial(best, validate, [prevent(e), dummy]) ]),
			enter = each([defer(setPic)(e), defer(doDataSet)(deferType(e))]),
			restore = each([reSetPic, doDataRESET]),
			match = deferpartial(equals, getCurrent(), deferType(e)),
            thenInvoke = nest([invoke, deferpartial(best, match, [restore, enter])]),
            doInvoke = nest([invoke, deferpartial(best, validate, [each([thenInvoke, deferScroll]), dummy])]);
        
        //resetPic(e);
        

		preventer();
        doReset();
        doInvoke();
	});
}());