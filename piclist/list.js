var scrollPicture = function(options){
	if(!Function.prototype.bind){
		Function.prototype.bind = function() {
			if (arguments.length < 2 && typeof arguments[0] == "undefined") return this;
			var __method = this, args = jQuery.makeArray(arguments), object = args.shift();
			return function() {
				return __method.apply(object, args.concat(jQuery.makeArray(arguments)));
			}
		}
	}
	this.init(options);
}
scrollPicture.prototype = {
	init: function(options){
		this.options = {
			btnPrev: null,
			btnNext: null,
			objBox: null,
			curIndex: 1,
			showLen: 0,
			width: 0,
			moveLen: 1
		}
		$.extend(this.options, options);
		this.left = 0;
		this.mid = Math.ceil(this.options.showLen / 2);
		this.curIndex = this.options.curIndex;
		this.timer = null;
		this.lock = false;
		//this.isMobile = (navigator.userAgent.indexOf('iPhone') != -1) || (navigator.userAgent.indexOf('iPod') != -1) || (navigator.userAgent.indexOf('iPad') != -1) || navigator.userAgent.match(/Android/i);
		if(this.options.objBox){
			this.setHTML();
			this.handleBind();
		}
	},
	setHTML: function(){
		this.options.objBox.style.left = '0px';
		this.items = this.options.objBox.getElementsByTagName('li');
		this.max = Math.max(this.items.length - this.options.showLen + 1, 1);
		this.openPictureByIndex(this.curIndex);
	},
	openPictureByIndex: function(index){
		if(index < 1){
			index = 1;
		}else if(index > this.max){
			index = this.max;
		}
		this.lock = true;
		this.toCurrent(index);
	},
	handleBind: function(){
		$(this.options.btnPrev).bind('click', this.toPrevImg.bind(this));
		$(this.options.btnNext).bind('click', this.toNextImg.bind(this));
		/* if(this.isMobile){
			$(this.options.objBox).bind('touchstart', this.touchImgStart.bind(this));
			$(this.options.objBox).bind('touchmove', this.touchImgMove.bind(this));
			$(this.options.objBox).bind('touchend', this.touchImgEnd.bind(this));
		} */
	},
	/* touchImgStart: function(e){
		e = e || window.event;
		if (!e.touches.length) return;
		var touch = e.touches[0];
		this.startX = touch.pageX;
	},
	touchImgMove: function(e){
		e = e || window.event;
		e.preventDefault ? e.preventDefault() : e.returnValue = false;
		if (!e.touches.length) return;
		var touch = e.touches[0];
		this.endX = touch.pageX;
	},
	touchImgEnd: function(e){
		e = e || window.event;
		if(!this.endX){
			this.startX = 0;
			this.endX = 0;
			return;
		}
		if(this.endX < this.startX){
			this.toNextImg(e);
		}else{
			this.toPrevImg(e);
		}
		this.startX = 0;
		this.endX = 0;
	}, */
	toPrevImg: function(e){
		e = e || window.event;
		if(this.lock || this.curIndex == 1){
			return;
		}
		this.lock = true;
		var newIndex = this.curIndex - 1;
		this.toCurrent(newIndex);
		e.preventDefault ? e.stopPropagation() : e.cancelBubble = true;
		e.preventDefault ? e.preventDefault() : e.returnValue = false;
	},
	toNextImg: function(e){
		e = e || window.event;
		if(this.lock || this.curIndex == this.max){
			return;
		}
		this.lock = true;
		var newIndex = this.curIndex + 1;
		this.toCurrent(newIndex);
		e.preventDefault ? e.stopPropagation() : e.cancelBubble = true;
		e.preventDefault ? e.preventDefault() : e.returnValue = false;
	},
	toCurrent: function(index){
		this.options.btnPrev.style.display = index == 1 ? 'none' : 'block';
		this.options.btnNext.style.display = index >= this.max ? 'none' : 'block';
		this.curIndex = index;
		this.marquee(- (this.curIndex - 1) * this.options.width);
		//this.showImg(this.curIndex);
	},
	showImg: function(index){
		var item;
		for(var i = index - 1, l = i + this.options.showLen; (item = this.items[i]) && i < l; i++){
			var img = item.childNodes[0];
			if(img.getAttribute('_src')){
				img.src = img.getAttribute('_src');
				img.removeAttribute('_src');
			}
		}
	},
	marquee: function(targetLeft){
		var nowLeft = parseInt(this.options.objBox.style.left);
		var left = targetLeft - nowLeft;
		if(this.isMobile){
			if(left == 0){
				this.lock = false;
				return;
			}else if(left < 0){
				this.options.objBox.style.webkitAnimation = 'moveR 200ms ease-out forwards';
			}else{
				this.options.objBox.style.webkitAnimation = 'moveL 200ms ease-out forwards';
			}
			//this.options.objBox.style.webkitTransform = 'translateX(' + left + 'px)';
			setTimeout(function(){
				this.options.objBox.style.left = targetLeft + 'px';
				this.options.objBox.style.webkitAnimation = '';
				this.lock = false;
			}.bind(this), 200);
		}else{
			if(left == 0){
				this.lock = false;
				clearTimeout(this.timer);
			}else{
				this.options.objBox.style.left = nowLeft + (left > 0 ? Math.ceil(left / 5) : Math.floor(left / 3)) + 'px';
				this.timer = setTimeout(function(){this.marquee(targetLeft)}.bind(this), 20);
			}
		}
	}
}