(function() {
// 辅助函数
var arr = [],
	push = arr.push;

// 核心构造函数
var itcast = function(selector) {
	return new itcast.fn.init(selector);
};
// 核心原型
itcast.fn = itcast.prototype = {
	constructor: itcast,
	// 长度的默认值
	length: 0,
	// 用来判断是否是一个itcast对象
	selector: "",
	init: function(selector) {
		// 1 null / undefined / "" / 0
		if(!selector) {
			// 返回的是一个 空的itcasst对象
			return this;
		}

		// string
		else if(typeof selector === "string") {
			// 1 如果是html字符串
			if(selector.charAt(0) === "<") {
				// 获取到所有的通过 html字符串 创建出来的对象
				push.apply(this, parseHTML(selector));
			} else {
				// 获取到所有的通过 选择器 匹配到的对象
				push.apply( this, select( selector ) );
			}
		}

		// 3 DOM对象
		else if(selector.nodeType) {
			// selector 就是唯一的一个元素
			this[0] = selector;
			this.length = 1;
		}

		// 4 itcast对象
		else if("selector" in selector) {
			// 因为调用 itcast() 就是来获取到一个itcast对象
			// 如果传入的就是itcast对象，直接返回就行
			return selector;
		}

		// 5 DOM数组
		else if(selector.length && selector.length >= 0) {
			// 要将数组中的元素拿出来 放到 this 中去
			push.apply(this, selector);
		}

		// 6 函数（入口函数）
		else if(typeof selector === "function") {
			// window.onload = selector;
			// window.addEventListener("load", selector);
			if(window.addEventListener) {
				window.addEventListener("load", selector);
			} else {
				window.attachEvent("onload", selector);
			}

			// 如果要考虑事件执行顺序的问题，就不能直接简单的
			// 绑定事件了
		}
	}
};
itcast.fn.init.prototype = itcast.prototype;

// 将 html字符串 转化为 DOM对象数组
var parseHTML = function(html) {
	var tempDv, arr = [];
	tempDv = document.createElement("div");
	tempDv.innerHTML = html;

	arr.push.apply(arr, tempDv.childNodes);
	return arr;
};

// 选择器方法
var select = function(selector) {
	var first = selector.charAt(0), arr = [];
	if(first === "#") {
		arr.push(document.getElementById(selector.slice(1)));
	} else if(first === ".") {
		arr.push.apply(arr, document.getElementsByClassName(selector.slice(1)));
	} else {
		arr.push.apply(arr, document.getElementsByTagName(selector));
	}

	return arr;
};

// 获取下一个元素节点的方法
var getNextSibling = function(dom) {
	var node = dom;
	while(node = node.nextSibling) {
		if(node.nodeType === 1) {
			return node;
		}
	}
};

// 获取后面所有元素节点的方法
var getNextAllSibling = function(dom) {
	var node = dom;
	var arr = [];
	while(node = node.nextSibling) {
		if(node.nodeType === 1) {
			arr.push(node);
		}
	}

	return arr;
};



// 提供扩展方法
itcast.extend = itcast.fn.extend = function(obj) {
	var k;
	for(k in obj) {
		this[k] = obj[k];
	}
};

// 工具型的each函数
itcast.extend({
	each: function(obj, callback) {
		var i, len;
		if( itcast.isLikeArray(obj) ) {
			for(i = 0, len = obj.length; i < len; i++) {
				if( callback.call(obj[i], i, obj[i]) === false) {
					break;
				}
				}
		} else {
			for(i in obj) {
				if( callback.call(obj[i], i, obj[i]) === false) {
					break;
				}
			}
		}
		// 把遍历的 数组或者是对象 给返回
		return obj;
	},
	trim: function(str) {
		if(String.prototype.trim) {
			return str.trim();
		} else {
			return str.replace(/^\s+|\s+$/g, "");
		}
	}
});

// 判断方法 -工具型方法
itcast.extend({
	isLikeArray: function(obj) {
		return !!obj && obj.length >= 0;
	},
	isString: function(obj) {
		return typeof obj === "string";
	},
	isDOM: function(obj) {
		return !!obj.nodeType;
	},
	isItcast: function(obj) {
		// 如果有 selector 这个属性就认为是 itcast 对象
		// return !!obj.selector;
		return "selector" in obj;
	}
});

// 工具方法 -获取文本内容
itcast.extend({
	getInnerText: function(node) {
		var txtArr = [];
		var getText = function(node) {
			var cNodes = node.childNodes;
			for(var i = 0; i < cNodes.length; i++) {
				if(cNodes[i].nodeType === 3) {
					txtArr.push(cNodes[i].nodeValue);
				} else if(cNodes[i].nodeType === 1) {
					getText(cNodes[i]);
				}
			}
		};

		// 调用函数，才能执行
		getText(node);

		return txtArr.join("");
	}
});

// DOM操作模块
itcast.fn.extend({
	appendTo: function(obj) {
		var targetNodes = itcast(obj),
			sourceNodes = this,
			tarThis, arr = [], node;

		itcast.each(targetNodes, function(tarIndex) {
			tarThis = this;
			itcast.each(sourceNodes, function() {
				node = tarIndex === targetNodes.length - 1?
						this:
						this.cloneNode(true);
				tarThis.appendChild(node);

				arr.push(node);
			});
		});

		return itcast(arr);
	},
	append: function(dom) {
		itcast(dom).appendTo(this);
		return this;
	},
	prependTo: function(dom) {
		var targetNodes = itcast(dom),
			sourceNodes = this, // this 是一个itcast对象
			i, j,
			tarLen = targetNodes.length,
			srcLen = sourceNodes.length,
			arr = [], node;

		for(i = 0; i < tarLen; i++) {
			for(j = 0; j < srcLen; j++) {
				node = i === tarLen - 1 ?
							sourceNodes[j]:
							sourceNodes[j].cloneNode(true);
				targetNodes[i].insertBefore(node, 
							targetNodes[i].firstChild);

				arr.push(node);
			}
		}

		return itcast(arr);
	},
	prepend: function(dom) {
		itcast(dom).prependTo(this);

		return this;
	},
	remove: function() {
		return this.each(function() {
			this.parentNode.removeChild(this);
		});
	}
});

// DOM操作模块-获取后续元素
itcast.fn.extend({
	next: function() {
		var arr = [], i;
		for(i = 0; i < this.length; i++) {
			var nextNode = getNextSibling(this[i]);
			if(nextNode !== undefined) {
				arr.push( nextNode );
			}
		}
		return itcast(arr);
	},
	nextAll: function() {
		var arr = [], i;
		for(i = 0; i < this.length; i++) {
			arr.push.apply(arr, getNextAllSibling(this[i]));
		}
		return itcast(arr);
	}
});

// 实例方法 -each
itcast.fn.extend({
	each: function(callback) {
		return itcast.each(this, callback);
	}
});

// 事件模块
itcast.each( ("click,mouseenter,mouseleave,change" +
			  "mouseover,mouseout,blur,focus").split(","), function(i, v) {
	itcast.fn[v] = function(callback) {
		this.on(v, callback);

		return this;
	};
});

// on绑定事件 和 off解绑事件
itcast.fn.extend({
	on: function(type, callback) {
		this.each(function() {
			if(window.addEventListener) {
				this.addEventListener(type, callback);
			} else if(window.attachEvent) {
				this.attachEvent("on" + type, function(e) {
					callback.call(this, e);
				});
			} else {
				this["on" + type] = function(e) {
					e = e || window.event;
					callback.call(this, e);
				};
			}
		});

		return this;
	},
	off: function(type, callback) {
		this.each(function() {
			this.removeEventListener(type, callback);
		});

		return this;
	},
	hover: function(fn1, fn2) {
		this.mouseenter(fn1).mouseleave(fn2);

		return this;
	},
	toggle: function() {
		if(arguments.length <= 0) {
			return;
		}
		// 获取传入的函数列表
		var args = arguments,
			i = 0, len = args.length;

		this.click(function() {
			args[i++ % len].call(this);
			console.log(this);
		});

		// 支持多个元素
		/*if(arguments.length <= 0) {
			return;
		}

		var args = arguments, 
			len = args.length;
		this.each(function() {
			var i = 0;

			itcast(this).click(function() {
				// args[i++ % len].call(this);
				console.log(i++ % len);
			});
		});*/
		
	}
});

// 样式操作模块
itcast.fn.extend({
	css: function(name, value) {
		if(value === undefined && typeof name === "string") {
			if(window.getComputedStyle) {
				var styles = window.getComputedStyle(this[0]);
				return styles[ name ];
			} else {
				return this[0].currentStyle[ name ];
			}
		}

		// 如果设置值
		this.each(function() {
			if(value === undefined && typeof name === "object") {
				for(var k in name) {
					this.style[k] = name[k];
				}
			} else {
				this.style[name] = value;
			}
		});
		
		// 设置返回的值
		return this;
	},
	addClass: function(cName) {
		this.each(function() {
			var clsName = this.className;
			clsName += " " + cName;
			this.className = itcast.trim(clsName);
		});

		return this;
	},
	removeClass: function(cName) {
		this.each(function() {
			var clsName = " " + this.className + " ";
			clsName = clsName.replace(" " + cName + " ", " ");
			this.className = itcast.trim(clsName);
		});

		return this;
	},
	hasClass: function(cName) {
		var hasCls = false;
		this.each(function() {
			var clsName = this.className;
			hasCls = (" " + clsName + " ").indexOf(" " + cName + " ") !== -1;
			if(hasCls) {
				return false;
			}
		});

		return hasCls;
	},
	toggleClass: function(cName) {
		this.each(function() {
			if( itcast(this).hasClass(cName) ) {
				itcast(this).removeClass(cName);
			} else {
				itcast(this).addClass(cName);
			}
		});

		return this;
	}
});


// 属性操作模块
itcast.fn.extend({
	attr: function(name, value) {
		if(value === undefined) {
			return this[0].getAttribute(name);
		}

		this.each(function() {
			this.setAttribute(name, value);
		});
		return this;
	},
	val: function(value) {
		if(value === undefined) {
			return this[0].value;
		}

		this.each(function() {
			this.value = value;
		});
		return this;
	},
	html: function(str) {
		if(str === undefined) {
			return this[0].innerHTML;
		}

		this.each(function() {
			this.innerHTML = str;
		});

		return this;
	},
	text: function(txt) {
		if(txt === undefined) {
			var arr = [];
			// 如果支持这两个属性中的任何一个
			if("innerText" in this[0] || "textContent" in this[0]) { 
				// 要把获取到的所有元素的内容都要去除
				this.each(function() {
					arr.push(this.innerText || this.textContent);
				});

				return arr.join("");
			}
			
			// 获取多个（自己实现的功能）
			this.each(function() {
				arr.push(itcast.getInnerText(this));
			});
			return arr.join("");
		}

		// 设置，最后要返回 当前获取到的所有元素
		this.each(function() {
			if("innerText" in this || "textContent" in this) {
				this.innerText = txt;
				this.textContent = txt;
			} else {
				// 兼容性处理
				this.innerHTML = "";
				var txtNode = document.createTextNode(txt);
				this.appendChild(txtNode);
			}
		});

		return this;
	}
});

// ------------------- 动画的辅助函数 start -------------------
var easingObj = {
	// t: 已经经过时间, b: 开始位置, c: 目标位置, d: 总时间
	easing1: function(x, t, b, c, d) {
		return t * ( (c - b) / d );
	},
	easing2: function(x, t, b, c, d) {
		var a = 2 * (c - b) / (d * d),
			v_0 = a * d;
		return v_0 * t - 1/2 * a * t * t;
	},
	easeInQuad: function (x, t, b, c, d) {
		return c*(t/=d)*t + b;
	},
	easeOutQuad: function (x, t, b, c, d) {
		return -c *(t/=d)*(t-2) + b;
	},
	easeInOutQuad: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t + b;
		return -c/2 * ((--t)*(t-2) - 1) + b;
	},
	easeInCubic: function (x, t, b, c, d) {
		return c*(t/=d)*t*t + b;
	},
	easeOutCubic: function (x, t, b, c, d) {
		return c*((t=t/d-1)*t*t + 1) + b;
	},
	easeInOutCubic: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t + b;
		return c/2*((t-=2)*t*t + 2) + b;
	},
	easeInQuart: function (x, t, b, c, d) {
		return c*(t/=d)*t*t*t + b;
	},
	easeOutQuart: function (x, t, b, c, d) {
		return -c * ((t=t/d-1)*t*t*t - 1) + b;
	},
	easeInOutQuart: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
		return -c/2 * ((t-=2)*t*t*t - 2) + b;
	},
	easeInQuint: function (x, t, b, c, d) {
		return c*(t/=d)*t*t*t*t + b;
	},
	easeOutQuint: function (x, t, b, c, d) {
		return c*((t=t/d-1)*t*t*t*t + 1) + b;
	},
	easeInOutQuint: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
		return c/2*((t-=2)*t*t*t*t + 2) + b;
	},
	easeInSine: function (x, t, b, c, d) {
		return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
	},
	easeOutSine: function (x, t, b, c, d) {
		return c * Math.sin(t/d * (Math.PI/2)) + b;
	},
	easeInOutSine: function (x, t, b, c, d) {
		return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
	},
	easeInExpo: function (x, t, b, c, d) {
		return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
	},
	easeOutExpo: function (x, t, b, c, d) {
		return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
	},
	easeInOutExpo: function (x, t, b, c, d) {
		if (t==0) return b;
		if (t==d) return b+c;
		if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
		return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
	},
	easeInCirc: function (x, t, b, c, d) {
		return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
	},
	easeOutCirc: function (x, t, b, c, d) {
		return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
	},
	easeInOutCirc: function (x, t, b, c, d) {
		if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
		return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
	},
	easeInElastic: function (x, t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
	},
	easeOutElastic: function (x, t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
	},
	easeInOutElastic: function (x, t, b, c, d) {
		var s=1.70158;var p=0;var a=c;
		if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
		if (a < Math.abs(c)) { a=c; var s=p/4; }
		else var s = p/(2*Math.PI) * Math.asin (c/a);
		if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
		return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
	},
	easeInBack: function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158;
		return c*(t/=d)*t*((s+1)*t - s) + b;
	},
	easeOutBack: function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158;
		return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
	},
	easeInOutBack: function (x, t, b, c, d, s) {
		if (s == undefined) s = 1.70158; 
		if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
		return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
	},
	easeOutBounce: function (x, t, b, c, d) {
		if ((t/=d) < (1/2.75)) {
			return c*(7.5625*t*t) + b;
		} else if (t < (2/2.75)) {
			return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
		} else if (t < (2.5/2.75)) {
			return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
		} else {
			return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
		}
	}
};

// 动画属性的键值对
var styleObj = {
	"top": "offsetTop",
	"left": "offsetLeft",
	"width": "offsetWidth",
	"height": "offsetHeight"
};
// 函数 获取startLoaction
var getLocation = function(dom, target) {
	var o = {};
	for(var k in target) {
		o[k] = dom[ styleObj[k] ];
	}
	return o;
};

// 函数 获取Distance
var getDistance = function(dom, target) {
	var o = {};

	for(var k in target) {
		o[k] = target[k] - dom[ styleObj[k] ];
	}

	return o;
};

// 获取 tweens 的函数
var easingFn = function(x, t, startLoc, target, d, easing) {
	var o = {};
	for(var k in target) {
		o[k] = easingObj[easing](x, t, startLoc[k], target[k], d);
	}

	return o;
};

// 设置样式
var setStyle = function(dom, startLoc, tweens) {
	for(var k in startLoc) {
		dom.style[k] = startLoc[k] + tweens[k] + "px";
	}
};
// ------------------- 动画的辅助函数 end -------------------

// 动画模块
itcast.fn.extend({
	animate: function(target, dur, easing) {
		var node = this[0];

		var startTime = +new Date(),
			startLocations = getLocation(node, target),

			totalDistances = getDistance(node, target),

			play, timerId;

		play = function() {
			var curTime = +new Date();
			var passingTime = curTime - startTime,
				tweens;
			if(passingTime >= dur) {
				tweens = totalDistances;
				clearInterval(timerId);

			} else {
				tweens = easingFn(null, passingTime, startLocations, target, dur, easing);
			}
			setStyle(node, startLocations, tweens);
		};
		play();

		timerId = setInterval(play, 16);
	}
});


// 现在上课的代码可能看不懂，如果将来某一天你看到了这句话：
// 但是如果你还看不懂？问下自己，这样合适吗？？？？？？
// by lx

// 对外暴露核心函数
window.I = window.itcast = itcast;

})();