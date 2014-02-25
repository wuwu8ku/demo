require.config({
	baseUrl:'js/lib',
	paths:{
		jquery: 'jquery.min',
		mod: '../mod'
	}
})

require(['jquery'], function() {
   console.log($);
});
