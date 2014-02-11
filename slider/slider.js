var Bind = function(object, fun) {
	var args = Array.prototype.slice.call(arguments).slice(2);
	return function() {
		return fun.apply(object, args);
	}
}
var BindAsEventListener = function(object, fun) {
	return function(event) {
		return fun.call(object, (function(e){
			var oEvent = window.event || e;
			if (window.event) {
				oEvent.pageX = oEvent.clientX + document.documentElement.scrollLeft;
				oEvent.pageY = oEvent.clientY + document.documentElement.scrollTop;
				oEvent.preventDefault = function () { this.returnValue = false; };
				oEvent.detail = oEvent.wheelDelta / (-40);
				oEvent.stopPropagation = function(){ this.cancelBubble = true; }; 
			}
			return oEvent;
		})(event));
	}
}
function addEventHandler(oTarget, sEventType, fnHandler) {
	if (oTarget.addEventListener) {
		oTarget.addEventListener(sEventType, fnHandler, false);
	} else if (oTarget.attachEvent) {
		oTarget.attachEvent("on" + sEventType, fnHandler);
	} else {
		oTarget["on" + sEventType] = fnHandler;
	}
};
function removeEventHandler(oTarget, sEventType, fnHandler) {
    if (oTarget.removeEventListener) {
        oTarget.removeEventListener(sEventType, fnHandler, false);
    } else if (oTarget.detachEvent) {
        oTarget.detachEvent("on" + sEventType, fnHandler);
    } else { 
        oTarget["on" + sEventType] = null;
    }
};
//滑动条程序
var Slider = function() { 
	this.initialize.apply(this, arguments); 
};
Slider.prototype = {
	//容器对象，滑块
	initialize: function(container, options) {
		this.SetOptions(options);
		this.Container = document.getElementById(container);
		this._horizontal = !!this.options.Horizontal;//一般不允许修改
		this._timer = null;//自动滑移的定时器
		this._ondrag = false;//解决ie的click问题
		this._IsMin = this._IsMax = this._IsMid = false;//是否最小值、最大值、中间值
		this.MinValue = this.options.MinValue;
		this.MaxValue = this.options.MaxValue;
		this.Step = this.Container.clientWidth * this.options.Step / (this.MaxValue - this.MinValue);
		this.intervalTime = Math.max(1, this.options.intervalTime);
		this.Ease = !!this.options.Ease;
		this.EaseTime = Math.max(1, this.options.EaseTime);
		this.onMin = this.options.onMin;
		this.onMax = this.options.onMax;
		this.onMid = this.options.onMid;
		this.onDragStart = this.options.onDragStart;
		this.onDragStop = this.options.onDragStop;
		this.onMove = this.options.onMove;
		
		this.setFocus(this.Container);
		
		//创建滑块
		this.Handle = [];
		if(!this.options.Values || this.options.Values.length==0){
			this.options.Values = [this.options.value || 0];
		}
		this.options.Values.sort(function(a,b){
			return a>b ? 1 : -1;
		})
		var length = Math.min(this.options.Values.length, 2);//最多2个滑块
		this.Index = 0;
		for(var i=0,l=length;i<l;i++){
			var handle = document.createElement('div');
			handle.className = 'ui-slider-handle';
			this.Container.appendChild(handle);
			//取消冒泡，防止跟Container的click冲突
			addEventHandler(handle, "click", BindAsEventListener(this, function(e){ e.stopPropagation(); }));
			//实例化一个拖放对象，并限定范围
			var _drag = new Drag(handle, {
				Limit: true, 
				mxContainer: this.Container,
				onStart: Bind(this, this.DragStart), 
				onStop: Bind(this, this.DragStop), 
				onMove: Bind(this, this.Move),
				Step: this.Step
			});
			//锁定拖放方向
			_drag[this._horizontal ? "LockY" : "LockX"] = true;	
			this.Handle.push({target:handle, drag:_drag});
			this.Index = i;
			this.SetValue(this.options.Values[i], true);
		}
		this.Length = length;
		this.SetRange();
		if(this.Length == 2){
			var range = document.createElement('div');
			range.className = 'ui-slider-range';
			this.Container.appendChild(range);
			this.Range = range;
			this.SetRangePos();
		}
		
		//点击控制
		addEventHandler(this.Container, "click", BindAsEventListener(this, function(e){ this._ondrag || this.ClickCtrl(e);}));
	},
	Extend:function(destination, source) {
		for (var property in source) {
			destination[property] = source[property];
		}
	},
  //设置默认属性
	SetOptions: function(options) {
		this.options = {//默认值
			MinValue:    0,//最小值
			MaxValue:    100,//最大值
			Step: 		1,//步长，单位value
			Value:		0,//当前位置
			Values:		[],//当前位置
			Horizontal:    true,//是否水平滑动
			intervalTime:    20,//滑动动画间隔,越大越慢
			Ease:        false,//是否缓动
			EaseTime:    5,//缓动时间,越大越慢
			onMin:        function(){},//最小值时执行
			onMax:        function(){},//最大值时执行
			onMid:        function(){},//中间值时执行
			onDragStart:	function(){},//拖动开始时执行
			onDragStop:    function(){},//拖动结束时执行
			onMove:        function(){}//滑动时执行
		};
		this.Extend(this.options, options || {});
	},
	//开始拖放滑动
	DragStart: function() {
		this.onDragStart();
		this._ondrag = true;
	},
	//结束拖放滑动
	DragStop: function() {
		this.SetRange();
		this.onDragStop();
		setTimeout(Bind(this, function(){ this._ondrag = false; }), 10);
	},
	//滑动中
	Move: function() {
		this.SetRangePos();
		this.onMove();
		var percents = this.GetPercent();
		var percent = percents;
		var min = 0,max = 1;	
		if(percents && percents.length==2){
			if(this.Index == 0){
				max = percents[1];
			}else{
				min = percents[0];
			}
			percent = percents[this.Index];
		}
		//最小值判断
		if(percent > min){
			this._IsMin = false;
		}else{
			if(!this._IsMin){ this.onMin(); this._IsMin = true; }
		}
		//最大值判断
		if(percent < max){
			this._IsMax = false;
		}else{
			if(!this._IsMax){ this.onMax(); this._IsMax = true; }
		}
		//中间值判断
		if(percent > min && percent < max){
			if(!this._IsMid){ this.onMid(); this._IsMid = true; }
		}else{
			this._IsMid = false;
		}
	},
	//设置焦点参数
	setFocus: function(o) {
		//设置tabIndex使设置对象能支持focus
		o.tabIndex = -1;
		//取消focus时出现的虚线框
		if(!document.all){
			o.style.outline = "none"
		}
	},
	//鼠标点击控制
	ClickCtrl: function(e) {
		var o = this.Container.getBoundingClientRect();
		var clickX = e.clientX - o.left;
		if(this.Length == 2){
			var leftBarX = this.Handle[0]['target'].offsetLeft,
				rightBarX = this.Handle[1]['target'].offsetLeft;
			if(clickX <= leftBarX){
				this.Index = 0;
			}else if(clickX >= rightBarX){
				this.Index = 1;
			}else {
				this.Index = clickX - leftBarX <= rightBarX - clickX ? 0 : 1;
			}
		}
		var target = this.Handle[this.Index]['target'];
		this.EasePos(clickX - target.offsetWidth / 2, clickX - target.offsetHeight / 2);
	},
	SetRange: function(){
		if(this.Length == 2){
			var left = this.Handle[0],
				right = this.Handle[1];
			left.drag.SetHorRange(0, right.target.offsetLeft + right.target.offsetWidth);
			right.drag.SetHorRange(left.target.offsetLeft, 9999);
		}
	},
	//获取当前值
	GetValue: function() {
		//根据最大最小值和滑动百分比取值
		var percent = this.GetPercent();
		var sum = this.MaxValue - this.MinValue,
			min = this.MinValue,
			step = this.options.Step;
		if(typeof percent == 'number'){
			return Math.round(Math.round( (min + percent * sum) / step ) * step);
		}else{
			var values = [];
			for(var i=0,l=percent.length;i<l;i++){
				values.push(Math.round(Math.round( (min + percent[i] * sum) / step ) * step));
			}
			return values;
		}
		
	},
	//设置值位置
	SetValue: function(value, noEase) {
		//根据最大最小值和参数值设置滑块位置
		this.SetPercent((value- this.MinValue)/(this.MaxValue - this.MinValue), !!noEase);
	},
	//获取百分比
	GetPercent: function() {
		var target;
		//根据滑动条滑块取百分比
		if(this.Length==2){
			var result = [];
			for(var i=0;i<2;i++){
				target = this.Handle[i]['target'];
				result.push(this._horizontal ? target.offsetLeft / (this.Container.clientWidth - target.offsetWidth) : target.offsetTop / (this.Container.clientHeight - target.offsetHeight));
			}
			return result;
		}else{
			target = this.Handle[this.Index]['target'];
			return this._horizontal ? target.offsetLeft / (this.Container.clientWidth - target.offsetWidth) : target.offsetTop / (this.Container.clientHeight - target.offsetHeight)
		}
		
	},
	//设置百分比位置
	SetPercent: function(value, noEase) {
		//根据百分比设置滑块位置
		this.EasePos((this.Container.clientWidth - this.Handle[this.Index]['target'].offsetWidth) * value, (this.Container.clientHeight - this.Handle[this.Index]['target'].offsetHeight) * value, noEase);
	},
	//停止滑移
	Stop: function() {
		clearTimeout(this._timer);
	},
	//缓动滑移
	EasePos: function(iLeftT, iTopT, noEase) {
		this.Stop();
		//必须是整数，否则可能死循环
		iLeftT = Math.round(Math.round(iLeftT / this.Step) * this.Step); iTopT = Math.round(iTopT);
		//如果没有设置缓动
		if(noEase || !this.Ease){ this.SetPos(iLeftT, iTopT); return; }
		//获取缓动参数
		var iLeftN = this.Handle[this.Index]['target'].offsetLeft, iLeftS = this.GetStep(iLeftT, iLeftN)
		, iTopN = this.Handle[this.Index]['target'].offsetTop, iTopS = this.GetStep(iTopT, iTopN);
		//如果参数有值
		if(this._horizontal ? iLeftS : iTopS){
			//设置位置
			this.SetPos(iLeftN + iLeftS, iTopN + iTopS);
			//如果没有到极限值则继续缓动
			if(this._IsMid){ this._timer = setTimeout(Bind(this, this.EasePos, iLeftT, iTopT), this.intervalTime); }
		}
	},
	//获取步长
	GetStep: function(iTarget, iNow) {
		var iStep = (iTarget - iNow) / this.EaseTime;
		if (iStep == 0) return 0;
		if (Math.abs(iStep) < 1) return (iStep > 0 ? 1 : -1);
		return iStep;
	},
	//设置滑块位置
	SetPos: function(iLeft, iTop) {
		this.Stop();
		this.Handle[this.Index]['drag'].SetPos(iLeft, iTop);
		this.SetRange();
	},
	SetRangePos: function(){
		if(this.Range){
			var l = this.Handle[0]['target'],
				r = this.Handle[1]['target'],
				left = l.offsetLeft + l.offsetWidth/2,
				width = r.offsetLeft - l.offsetLeft;
			this.Range.style.cssText = 'left:'+ left +'px;width:'+ width +'px;';
		}
	}
};

//拖放程序
var Drag = function() { 
	this.initialize.apply(this, arguments); 
};
Drag.prototype = {
	//拖放对象
	initialize: function(drag, options) {
		this.Drag = typeof drag == 'string' ? document.getElementById('drag') : drag;//拖放对象
		this._x = this._y = 0;//记录鼠标相对拖放对象的位置
		this._marginLeft = this._marginTop = 0;//记录margin
		//事件对象(用于绑定移除事件)
		this._fM = BindAsEventListener(this, this.Move);
		this._fS = Bind(this, this.Stop);

		this.SetOptions(options);

		this.Limit = !!this.options.Limit;
		this.mxLeft = parseInt(this.options.mxLeft);
		this.mxRight = parseInt(this.options.mxRight);
		this.mxTop = parseInt(this.options.mxTop);
		this.mxBottom = parseInt(this.options.mxBottom);
		this.Step = this.options.Step;

		this.LockX = !!this.options.LockX;
		this.LockY = !!this.options.LockY;
		this.Lock = !!this.options.Lock;

		this.onStart = this.options.onStart;
		this.onMove = this.options.onMove;
		this.onStop = this.options.onStop;

		this._Handle = this.options.Handle || this.Drag;
		this._mxContainer = this.options.mxContainer || null;

		this.Drag.style.position = "absolute";
		//透明
		if(document.all && !!this.options.Transparent){
			//ie6渲染bug
			this._Handle.style.overflow = "hidden";
			//填充拖放对象
			with(this._Handle.appendChild(document.createElement("div")).style){
				width = height = "100%"; backgroundColor = "#fff"; filter = "alpha(opacity:0)";
			}
		}
		//修正范围
		this.Repair();
		addEventHandler(this._Handle, "mousedown", BindAsEventListener(this, this.Start));
	},
	Extend:function(destination, source) {
		for (var property in source) {
			destination[property] = source[property];
		}
	},
	//设置默认属性
	SetOptions: function(options) {
		this.options = {//默认值
			Handle:   "",//设置触发对象（不设置则使用拖放对象）
			Limit:   false,//是否设置范围限制(为true时下面参数有用,可以是负数)
			Step:	1,//步长，单位px
			mxLeft:   0,//左边限制
			mxRight:  9999,//右边限制
			mxTop:   0,//上边限制
			mxBottom:  9999,//下边限制
			mxContainer: "",//指定限制在容器内
			LockX:   false,//是否锁定水平方向拖放
			LockY:   false,//是否锁定垂直方向拖放
			Lock:   false,//是否锁定
			Transparent: false,//是否透明
			onStart:  function(){},//开始移动时执行
			onMove:   function(){},//移动时执行
			onStop:   function(){}//结束移动时执行
		};
		this.Extend(this.options, options || {});
	},
	//准备拖动
	Start: function(oEvent) {
		if(this.Lock){ return; }
		this.Repair();
		//记录鼠标相对拖放对象的位置
		this._x = oEvent.clientX - this.Drag.offsetLeft;
		this._y = oEvent.clientY - this.Drag.offsetTop;
		//记录margin
		var currentStyle = this.Drag.currentStyle || window.getComputedStyle(this.Drag, null);
		this._marginLeft = parseInt(currentStyle.marginLeft) || 0;
		this._marginTop = parseInt(currentStyle.marginTop) || 0;
		//mousemove时移动 mouseup时停止
		addEventHandler(document, "mousemove", this._fM);
		addEventHandler(document, "mouseup", this._fS);
		if(document.all){
			//焦点丢失
			addEventHandler(this._Handle, "losecapture", this._fS);
			//设置鼠标捕获
			this._Handle.setCapture();
		}else{
			//焦点丢失
			addEventHandler(window, "blur", this._fS);
			//阻止默认动作
			oEvent.preventDefault();
		};
		//附加程序
		this.onStart();
	},
	//修正范围
	Repair: function() {
		if(this.Limit){
			//修正错误范围参数
			this.mxRight = Math.max(this.mxRight, this.mxLeft + this.Drag.offsetWidth);
			this.mxBottom = Math.max(this.mxBottom, this.mxTop + this.Drag.offsetHeight);
			//如果有容器必须设置position为relative来相对定位，并在获取offset之前设置
			if(this._mxContainer){
				var currentStyle = this._mxContainer.currentStyle || window.getComputedStyle(this._mxContainer, null);
				currentStyle.position == "relative" || currentStyle.position == "absolute" || (this._mxContainer.style.position = "relative");
			}
		}
	},
	//设置水平范围
	SetHorRange: function(mxLeft, mxRight) {
		this.mxLeft = mxLeft;
		this.mxRight = mxRight;
	},
	//拖动
	Move: function(oEvent) {
		//判断是否锁定
		if(this.Lock){ this.Stop(); return; };
		//清除选择
		window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
		//设置移动参数
		var left= Math.round(Math.round((oEvent.clientX - this._x) / this.Step) * this.Step);
		this.SetPos(left, oEvent.clientY - this._y);
	},
	//设置位置
	SetPos: function(iLeft, iTop) {
		//设置范围限制
		if(this.Limit){
			//设置范围参数
			var mxLeft = this.mxLeft, mxRight = this.mxRight, mxTop = this.mxTop, mxBottom = this.mxBottom;
			//如果设置了容器，再修正范围参数
			if(!!this._mxContainer){
				mxLeft = Math.max(mxLeft, 0);
				mxTop = Math.max(mxTop, 0);
				mxRight = Math.min(mxRight, this._mxContainer.clientWidth);
				mxBottom = Math.min(mxBottom, this._mxContainer.clientHeight);
			};
			//修正移动参数
			iLeft = Math.max(Math.min(iLeft, mxRight - this.Drag.offsetWidth), mxLeft);
			iTop = Math.max(Math.min(iTop, mxBottom - this.Drag.offsetHeight), mxTop);
		}
		//设置位置，并修正margin
		if(!this.LockX){ this.Drag.style.left = iLeft - this._marginLeft + "px"; }
		if(!this.LockY){ this.Drag.style.top = iTop - this._marginTop + "px"; }
		//附加程序
		this.onMove();
	},
	//停止拖动
	Stop: function() {
		//移除事件
		removeEventHandler(document, "mousemove", this._fM);
		removeEventHandler(document, "mouseup", this._fS);
		if(document.all){
			removeEventHandler(this._Handle, "losecapture", this._fS);
			this._Handle.releaseCapture();
		}else{
			removeEventHandler(window, "blur", this._fS);
		};
		//附加程序
		this.onStop();
		this._mxContainer.appendChild(this._Handle);
	}
};
