define(['mod/store'], function(store){
	var hello = function(){
		store.add();
	}
	return hello;
})