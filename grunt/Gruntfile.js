module.exports = function(grunt){

    // 项目配置
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        uglify: {
            options: {
                banner: '/*! <%= grunt.template.today("yyyy-mm-dd") %> */\n'
            },
			build: {
				files: [
					{
						expand: true, //启用动态扩展
						cwd: 'src/', //批匹配相对lib目录的src来源
						src: '**/*.js', //实际的匹配模式
						dest: 'dist/' //目标路径前缀
						//ext: '.js' //目标文件路径中文件的扩展名.
					}
				]
			}
        },
		htmlmin: {
			build: {
				options: {
					//removeComments: true,		//去注析
					collapseWhitespace: true	//去换行
				},
				files: [
					{
						expand: true, //启用动态扩展
						cwd: 'src/', //批匹配相对lib目录的src来源
						src: '**/*.html', //实际的匹配模式
						dest: 'dist/' //目标路径前缀
					}
				]
			}
		},
		cssmin: {
			build: {
				files: [
					{
						expand: true, //启用动态扩展
						cwd: 'src/', //批匹配相对lib目录的src来源
						src: '**/*.css', //实际的匹配模式
						dest: 'dist/' //目标路径前缀
					}
				]
			}
		},
		copy: {
			map: {
				files: [
					{
						expand: true, //启用动态扩展
						cwd: 'src/', //批匹配相对lib目录的src来源
						src: '**/*.map', //实际的匹配模式
						dest: 'dist/' //目标路径前缀
					}
				]
			}
		},
		watch: {
			options: {
				livereload: true,
			},
			html: {
				files: ['src/**/*.html'],
				tasks: ['htmlmin']
			},
			js: {
				files: ['src/**/*.js'],
				tasks: ['uglify']
			},
			css:{
				files: ['src/**/*.css'],
				tasks: ['cssmin']
			}
		}
    });

    // 加载提供"uglify"任务的插件
    grunt.loadNpmTasks('grunt-contrib-uglify');
	
	// 加载提供"copy"任务的插件
    grunt.loadNpmTasks('grunt-contrib-copy');
	
	// 加载提供"htmlmin"任务的插件
    grunt.loadNpmTasks('grunt-contrib-htmlmin');
	
	// 加载提供"cssmin"任务的插件
    grunt.loadNpmTasks('grunt-contrib-cssmin');
	
	// 加载提供"watch"任务的插件
    grunt.loadNpmTasks('grunt-contrib-watch');

    // 默认任务
    grunt.registerTask('build', ['uglify','htmlmin','cssmin','copy']);
	
	grunt.registerTask('live', ['uglify','htmlmin','cssmin','copy','watch']);
	
	// grunt.registerTask('default', 'Log some stuff.', function() {
        // grunt.log.write('Logging some stuff...').ok();
    // });
}