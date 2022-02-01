/*jslint nomen: true */
/*global window: false */
/*global document: false */



function defer(fun) {
    return function (a) {
        return function () {
            return fun(a);
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

function curry22(fun) {
    return function (b) {
        return function (a) {
            return function(){
                return fun(a, b);
            };
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

function curry33(fun) {
    return function (c) {
        return function (b) {
            return function (a) {
                return function(){
                    return fun(a, b, c);
            };
        };
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


function curryLeft3(fun) {
    return function (a) {
        return function (b) {
            return function(c){
                return fun(a, b, c);
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

function best(pred, actions){
    return actions.reduce(function(champ, contender){
        return champ = pred() ? champ : contender;
    });
    
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
    getTargetPicStyle = curry22(getProp)('style')(him),
    getDataSet = curry22(getProp)('dataset')(him),
    doEquals = curryLeft(equals),
    getTarget = curry2(getProp)('target'),
    isTargetPic = doEquals(him),
    getNodeName = curry2(getProp)('nodeName'),
    doReduce = function(cb, grp, ini){
        return grp.reduce(cb, ini);
    },
    doCompose = curryLeft3(doReduce)(compose),
    isLink = doCompose([getTarget, getNodeName, doEquals('A')]),
    isLocal = doCompose([getTarget, notExternal]),
    reSetPic = doCompose([getTargetPicStyle, doNull]),
    getCurrent = defer(curryLeft3(doReduce)(drill)(['dataset', 'current']))(him),
    getData = function(str){
        if(!str){
            return '';
        }
        var start = str.lastIndexOf('/'),
            end = str.lastIndexOf('.');
        return str.substring(start+1, end);
    },
    doBg = doReduce(compose, [getTargetPicStyle, setPropDefer])('backgroundImage'),
    getBody = curry22(getProp)('body')(document),
    getStyle = curry2(getProp)('style'),
    doBody = doReduce(compose, [getBody, getStyle, setPropDefer])('backgroundColor'),
    doDataSet = doReduce(compose, [getDataSet, setPropDefer])('current'),
    getHREF = curry3(invokeProp)('href')('getAttribute'),
    deferURL = doCompose([getTarget, getHREF, doURL]),
    deferType = doCompose([getTarget, getHREF, getData]),
    setPic = doCompose([deferURL, doBg]),
    doResetPic = doCompose([getTarget, doWhen(isTargetPic, reSetPic)]);

main.addEventListener('click', function(e){
    var pass = [isLink, isLocal].every(curry2(invoke)(e)),
        so = curry33(invokeProp)(curry2(invoke)(e))('every')([isLink, isLocal]),
        current = deferType(e),
        each = curry33(invokeProp)(invoke)('forEach'),
        enter = each([defer(setPic)(e), defer(doDataSet)(current)]),
        restore = each([reSetPic, defer(doDataSet)('')]),
        perform = each([thenInvoke, deferScroll]),
        preventer = doWhen(always(pass), prevent(e)),
        match = curry22(equals)(current)(getCurrent()),
        thenInvoke = doCompose([curry22(best)([restore, enter])(match), invoke]);
        preventer(e);
    doResetPic(e);
   //doWhen(so, perform)();
}); 