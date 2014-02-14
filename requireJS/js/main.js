require.config({
	baseUrl:'js/lib',
	paths:{
		jquery: 'jquery.min',
		mod: '../mod'
	},
	shim: {
        //'hello': ['jquery'],
		//'bye': ['jquery']
    },
	map: {
		// '*' means all modules will get 'jquery-private'
		// for their 'jquery' dependency.
		'*': {
			'jquery': 'jquery-private' ,
			'bye': 'mod/bye.1.0.0'
		},

		// 'jquery-private' wants the real jQuery module
		// though. If this line was not here, there would
		// be an unresolvable cyclic dependency.
		'jquery-private': { 'jquery': 'jquery' },
    }
})

/* require(['jquery'], function() {
   console.log($);
}); */

require(['mod/hello', 'bye'], function(hello, bye) {
   hello();
   bye();
});