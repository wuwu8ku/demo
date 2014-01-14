var LazyClass = function(elems) {
    this._init(elems);
	this._bindHandler();
    this._doLoad();
    // if (!this.elems.length)
        // this._release()
};
LazyClass.prototype = {
	_extendJson: function() {
		arguments[0] = arguments[0] || {};
		for (var i = 1, len = arguments.length; i < len; i++) {
			for (var para in arguments[i]) {
				arguments[0][para] = arguments[i][para]
			}
		}
		return arguments[0]
	},
	_trim: function(o, str) {
		var reg;
		if (str) {
			str = str.replace(/([\.\+\?\*\\\^\&\[\]\(\)\{\}\$\,])/g, '\\$1');
			reg = new RegExp("^(" + str + ")+|(" + str + ")+$", "g")
		} else {
			reg = /^\s+|\s+$/g
		}
		return o.replace(reg, "")
	},
	_removeEventHandler: function(oTarget, sEventType, fnHandler) {
		if (oTarget.listeners && oTarget.listeners[sEventType]) {
			var listeners = oTarget.listeners[sEventType];
			for (var i = listeners.length - 1; i >= 0 && fnHandler; i--) {
				if (listeners[i] == fnHandler) {
					listeners.splice(i, 1)
				}
			}
			if ((!listeners.length || !fnHandler) && listeners["_handler"]) {
				oTarget.removeEventListener ? oTarget.removeEventListener(sEventType, listeners["_handler"], false) : oTarget.detachEvent('on' + sEventType, listeners["_handler"]);
				delete oTarget.listeners[sEventType]
			}
		}
	},
	_addEventHandler: function(oTarget, sEventType, fnHandler) {
		oTarget.listeners = oTarget.listeners || {};
		var listeners = oTarget.listeners[sEventType] = oTarget.listeners[sEventType] || [];
		listeners.push(fnHandler);
		if (!listeners["_handler"]) {
			listeners["_handler"] = function(e) {
				var e = e || window.event;
				for (var i = 0, fn; fn = listeners[i++]; ) {
					fn.call(oTarget, e)
				}
			};
			oTarget.addEventListener ? oTarget.addEventListener(sEventType, listeners["_handler"], false) : oTarget.attachEvent('on' + sEventType, listeners["_handler"])
		}
	},
	_init: function(elems) {
		if(!Function.prototype.bind){
			Function.prototype.bind = function(){var __method = this;var args = Array.prototype.slice.call(arguments);var object=args.shift();return function(){return __method.apply(object,args.concat(Array.prototype.slice.call(arguments)));}}
		}
		
		this.options = [];
		this.lock = false;
		this.timer = null;
		this.range = {
			top:0,
			bottom: window.innerHeight || Math.max(document.documentElement.clientHeight, document.body.clientHeight)
		};
		for(var i=0,l=elems.length;i<l;i++){
			var elem = elems[i],
				className = elem.dataset ? elem.dataset['classname'] : elem.getAttribute('data-classname');
			if(className){
				this.options.push({elem: elem, className: className, loaded: false});
			}
		}
	},
	_bindHandler: function() {
		if(this.options.length){
			this._addEventHandler(window, "scroll", this._doLoad.bind(this));
			this._addEventHandler(window, "resize", this._resizeload.bind(this));
		}
	},
	_resizeload: function() {
		this.range.bottom = window.innerHeight || Math.max(document.documentElement.clientHeight, document.body.clientHeight);
		this._doLoad();
	},
	_doLoad: function() {
		var _this = this;
		if (!this.lock) {
			this.lock = true;
			this._loadRun();
		} else {
			clearTimeout(this.timer);
			var self = arguments.callee;
			this.timer = setTimeout(function() {
				self.call(_this)
			}, 50)
		}
	},
	_loadRun: function() {
		var options = this.options;
		if (options.length) {
			for (var i = 0, l = options.length; i < l; i++) {
				var op = options[i],
					elem = op['elem'],
					rect = this._getRect(elem),
					range = this.range;
				if(rect.bottom <= range.top){
					continue;
				}
				if(rect.top >= range.bottom){
					if(op.loaded){
						elem.className = elem.className.replace(op.className, '');
						op.loaded = false;
					}
					continue;
				}
				var height = rect.bottom-rect.top;
				if(!op.loaded){
					if((rect.top<=0 && (rect.bottom-range.top)/height >= 0.3) || (rect.top>0 && (range.bottom-rect.top)/height >= 0.3)){
						elem.className += ' '+ op.className;
						op.loaded = true;
					}
				}
			}
		}
		this.lock = false;
	},
	_getRect: function(elem) {
		var r = elem.getBoundingClientRect();
		return {top: r.top,bottom: r.bottom};
	}
}
