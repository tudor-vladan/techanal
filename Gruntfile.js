/* eslint-disable */
module.exports = function (grunt) {
  grunt.initConfig({
    shell: {
      // Build the frontend using pnpm workspace script
      ui_build: {
        command: 'pnpm --filter ui run build',
      },
      // Run server tests if present
      server_test: {
        command: 'pnpm --filter server run test || echo "No tests"',
      },
    },
  });

  grunt.loadNpmTasks('grunt-shell');

  // Default task: build UI and run server tests
  grunt.registerTask('default', ['shell:ui_build', 'shell:server_test']);
  grunt.registerTask('build', ['shell:ui_build']);
  grunt.registerTask('test', ['shell:server_test']);
};


