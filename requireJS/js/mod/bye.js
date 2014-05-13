define(['jquery','mod/store'], function($,store){
	return function(){
		store.remove();
	}
})