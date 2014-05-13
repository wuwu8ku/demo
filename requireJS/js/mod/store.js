define(function(){
	var index = (function(){
		console.log('init');
		return 0;
	})()

	return {
		index: index,
		remove: function(){
			this.index--;
		},
		add: function(){
			this.index++;
		}
	}
})