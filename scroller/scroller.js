var Scroller = function(options) {
    this._init(options);
	this._bindHandler();
    this._doLoad();
};
Scroller.prototype = {
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
	_init: function(options) {
		if(!Function.prototype.bind){
			Function.prototype.bind = function(){var __method = this;var args = Array.prototype.slice.call(arguments);var object=args.shift();return function(){return __method.apply(object,args.concat(Array.prototype.slice.call(arguments)));}}
		}
		var elems = options.elems || options;
		var scroller = options.scroller;
		this.options = [];	
		this.index = -1;
		this.lock = false;
		this.click = false;
		this.timer = null;
		this.range = window.innerHeight || Math.max(document.documentElement.clientHeight, document.body.clientHeight);
		for(var i=0,l=elems.length;i<l;i++){
			var elem = elems[i],
				index = elem.dataset ? elem.dataset['scroller'] : elem.getAttribute('data-scroller');
			index = parseInt(index);
			if(index!=-1 && scroller[index]){
				this.options.push({elem: elem, index: index});
			}
		}
		this.scroller = scroller;
		this.current = options.current;
		this.revise = options.revise || 0;
	},
	_bindHandler: function() {
		if(this.options.length){
			this._addEventHandler(window, "scroll", this._doLoad.bind(this));
			this._addEventHandler(window, "resize", this._resizeload.bind(this));
		}
		var scroller = this.scroller;
		var clickScroller = function(e){
			e = e || window.event;
			var target = e.target || e.srcElement;
			if(target.nodeName == 'A'){
				target = target.parentNode;
			}
			var index = parseInt(target.dataset ? target.dataset['scroller'] : target.getAttribute('data-scroller'));
			if(this.index == index){
				return;
			}
			var options = this.options;
			var distance = 0;
			for(var i=0,l=options.length;i<l;i++){
				if(options[i]['index'] == index){
					distance = this._getRect(options[i]['elem']).top + this.revise;
					break;
				}
			}
			if(distance){
				this.click = true;
				var last = this.scroller[this.index];
				if(last){
					last.className = last.className.replace(this.current, '');
				}
				this.scroller[index].className += ' '+ this.current;
				this.index = index;
				
				var timer = setInterval(function(){
					var d = Math.ceil( distance * 0.2 );
					window.scrollBy(0, d);
					
					if(d == 0){
						clearInterval(timer);
						this.click = false;
					}
					distance = distance - d;
				}.bind(this),15)
			}
			if (e.preventDefault){
				e.preventDefault(); 
			}else{
				e.returnValue = false; 
			}
		}
		for(var i=0,l=this.options.length;i<l;i++){
			this._addEventHandler(scroller[i], 'click', clickScroller.bind(this))
		}
	},
	_resizeload: function() {
		this.range = window.innerHeight || Math.max(document.documentElement.clientHeight, document.body.clientHeight);
		this._doLoad();
	},
	_doLoad: function() {
		if(this.click)return;
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
			var index = -1,
				percentage = 0;
			for (var i = 0, l = options.length; i < l; i++) {
				var op = options[i];

				var	elem = op['elem'],
					rect = this._getRect(elem),
					range = this.range;
				if(rect.bottom <= 0 || rect.top >= range){
					continue;
				}
				if((rect.top<=0 && rect.bottom>=range)||(rect.top>=0 && rect.bottom<=range)){			
					index = op['index'];
					break;
				}
				var height = rect.bottom-rect.top;
				var perc = rect.top<0 ? rect.bottom/height : (range-rect.top)/height;
				if(percentage){
					index = perc > percentage ? op['index'] : options[i-1]['index'];
					break;
				}else{
					index = op['index'];
					percentage = perc;
				}
			}
			if(this.index != index && index != -1){
				var last = this.scroller[this.index];
				if(last){
					last.className = last.className.replace(this.current, '');
				}
				this.scroller[index].className += ' '+ this.current;
				this.index = index;
			}
		}
		this.lock = false;
	},
	_getRect: function(elem) {
		var r = elem.getBoundingClientRect();
		return {top: r.top,bottom: r.bottom};
	}
}
