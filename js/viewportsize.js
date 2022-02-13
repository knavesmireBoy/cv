/*! viewportSize | Author: Tyson Matanich, 2013 | License: MIT */
/*jslint nomen: true */
/*global window: false */
/*global document: false */
/*global toString: false */
(function (window) {
	"use strict";
	//https://stackoverflow.com/questions/24119418/underscore-bind-not-work-in-ie8
	//https://stackoverflow.com/questions/13789618/differences-between-lodash-and-underscore
	if (typeof Function.prototype.bind === 'undefined') {
		Function.prototype.bind = function (context) {
			var fn = this,
				slice = Array.prototype.slice,
				args = slice.call(arguments, 1);
			return function () {
				return fn.apply(context, args.concat(slice.call(arguments)));
			};
		};
	}

	function undef(x) {
		return typeof (x) === 'undefined';
	}

	function isTypeOf(typ, arg) {
		return typeof arg === typ;
	}

	function getElement(arg) {
		if (arg && arg.parentNode) {
			return arg;
		}
		if (isTypeOf('string', arg)) {
			return document.getElementById(arg);
		}
		return window;
	}
	//var getComputedStyle = (function () {
	function sort(arg, styleProperty) {
		var computedStyle = null,
			defView = document.defaultView,
			element = getElement(arg);
		if (element === window) {
			return window[styleProperty];
		}
		if (typeof element.currentStyle !== 'undefined') {
			computedStyle = element.currentStyle;
		} else if (!undef(defView.getComputedStyle)) {
			computedStyle = defView.getComputedStyle(element, null);
		}
		if (computedStyle) {
			return computedStyle[styleProperty];
		}
	}
	//return sort;
	//}());
	window.getWinSize = function () {
		if (window.innerWidth !== undefined) {
			return [window.innerWidth, window.innerHeight];
		} else {
			var B = document.body,
				D = document.documentElement;
			return [Math.max(D.clientWidth, B.clientWidth),
				Math.max(D.clientHeight, B.clientHeight)
                   ];
		}
	};
	var getSize = function (Name) {
		var size,
			name = Name.toLowerCase(),
			document = window.document,
			documentElement = document.documentElement,
			bodyElement,
			divElement,
			sizeIs = window.getWinSize();
		//return sizeIs[0];
		if (window["inner" + Name] === undefined) {
			// IE6 & IE7 don't have window.innerWidth or innerHeight
			size = documentElement["client" + Name];
		} else if (window["inner" + Name] !== documentElement["client" + Name]) {
			// WebKit doesn't include scrollbars while calculating viewport size so we have to get fancy
			// Insert markup to test if a media query will match document.doumentElement["client" + Name]
			bodyElement = document.createElement("body");
			bodyElement.id = "vpw-test-b";
			bodyElement.style.cssText = "overflow:scroll";
			divElement = document.createElement("div");
			divElement.id = "vpw-test-d";
			divElement.style.cssText = "position:absolute;top:-1000px";
			// Getting specific on the CSS selector so it won't get overridden easily
			divElement.innerHTML = "<style>@media(" + name + ":" + documentElement["client" + Name] + "px){body#vpw-test-b div#vpw-test-d{" + name + ":7px!important}}</style>";
			bodyElement.appendChild(divElement);
			documentElement.insertBefore(bodyElement, document.head);
			if (divElement["offset" + Name] === 7) {
				// Media query matches document.documentElement["client" + Name]
				size = documentElement["client" + Name];
			} else {
				// Media query didn't match, use window["inner" + Name]
				size = window["inner" + Name];
			}
			// Cleanup
			documentElement.removeChild(bodyElement);
		} else {
			/*
            var win = window,
    doc = document,
    docElem = doc.documentElement,
    body = doc.getElementsByTagName('body')[0],
    x = win.innerWidth || docElem.clientWidth || body.clientWidth,
    y = win.innerHeight|| docElem.clientHeight|| body.clientHeight,
                box = body.getBoundingClientRect && body.getBoundingClientRect();
                */
			// Default to use window["inner" + Name]
			size = window["inner" + Name];
		}
		return size;
	};
	window.viewportSize = {};
	window.viewportSize.getHeight = function () {
		return getSize("Height");
	};
	window.viewportSize.getWidth = function () {
		return getSize("Width");
	};
	window.viewportSize.sort = sort;
}(this));