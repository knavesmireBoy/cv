/*jslint nomen: true */
/*global window: false */
/*global document: false */

function curry2(fun) {
    return function (secondArg) {
        return function (firstArg) {
            return fun(firstArg, secondArg);
        };
    };
}

function curry22(fun) {
    return function (secondArg) {
        return function (firstArg) {
            return function(){
                return fun(firstArg, secondArg);
            };
        };
    };
}

function curry3(fun) {
    return function (last) {
        return function (middle) {
            return function (first) {
                return fun(first, middle, last);
            };
        };
    };
}

function curry33(fun) {
    return function (last) {
        return function (middle) {
            return function (first) {
                return function(){
                    return fun(first, middle, last);
            };
        };
    };
};
}

function curryLeft(fun) {
    return function (firstArg) {
        return function (secondArg) {
            return fun(firstArg, secondArg);
        };
    };
}


function curryLeft3(fun) {
    return function (firstArg) {
        return function (secondArg) {
            return function(thirdArg){
                return fun(firstArg, secondArg, thirdArg);
        };
    };
};
}

function compose(v, f){
    return v = f(v);
}

function drill(o, p){
    return o = o[p];
}

function invoke(f, arg){
    return f(arg);
}

function always(arg){
    return function(){
        return arg;
    }
}

function doWhen(pred, action){
    return function(arg){
        if(pred(arg)){
            return action(arg);
        }
    };
}

function con(arg){
    console.log(arg);
    return arg;
}


//var compose = (...fns) => fns.reduce((f, g) => (..args) => f(g(..args)))

var main = document.querySelector('main'),
    him = document.querySelector('.him'),
    doScroll = function(){
        document.body.scrollTop = 0; // For Safari
        document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
    },
    deferScroll = function(){
        window.setTimeout(doScroll, 333);
    },
    notExternal = function(tgt){
        return tgt.href.indexOf(window.location.href) >= 0;
    },
    equals = function(a, b){
        //console.log(a, b)
        return a === b;
    },
    getProp = function(o, p){
        return p ? o[p] : o;
    },
    invokeProp = function(o, p, v){
        return o[p](v);
    },
    setProp = function(o,p,v){
        o[p] = v;
    },
    doURL = function(src){
        return "url(" + src + ")";
    },
    prevent = curry33(invokeProp)(null)('preventDefault'),
    doNull = curry3(setProp)(null)('backgroundImage'),
    setPropDefer = curryLeft3(setProp),
    getStyle = curry22(getProp)('style')(him),
    getDataSet = curry22(getProp)('dataset')(him),
    doEquals = curryLeft(equals),
    getTarget = curry2(getProp)('target'),
    isMan = doEquals(him),
    getNodeName = curry2(getProp)('nodeName'),
    doReduce = function(cb, grp, ini){
        return grp.reduce(cb, ini);
    },
    doCompose = curryLeft3(doReduce)(compose),
    isLink = doCompose([getTarget, getNodeName, doEquals('A')]),
    isLocal = doCompose([getTarget, notExternal]),
    reSetPic = doCompose([getStyle, doNull]),
    //getCurrent = curryLeft3(doReduce)(drill)(['dataset', 'current']),
    getData = function(str){
        if(!str){
            return '';
        }
        var start = str.lastIndexOf('/'),
            end = str.lastIndexOf('.');
        return str.substring(start+1, end);
    },
    doBg = doReduce(compose, [getStyle, setPropDefer])('backgroundImage'),
    doDataSet = doReduce(compose, [getDataSet, setPropDefer])('current'),
    getHREF = curry3(invokeProp)('href')('getAttribute'),
    deferURL = doCompose([getTarget, getHREF, doURL]),
    deferType = doCompose([getTarget, getHREF, getData]),
    setPic = doCompose([deferURL, doBg]),
    doResetPic = doCompose([getTarget, doWhen(isMan, reSetPic)]);

main.addEventListener('click', function(e){
    var pass = [isLink, isLocal].every(curry2(invoke)(e)),
        preventer = doWhen(always(pass), prevent(e)),
        current = deferType(e);
        preventer(e);
    doResetPic(e);
    
    if(pass){
        if(him.dataset.current === current){
            reSetPic();
            current = '';
        }
        else {
            setPic(e); 
        }
        deferScroll();
        doDataSet(current);
    }
}); 