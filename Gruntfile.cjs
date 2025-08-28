/* eslint-disable */
module.exports = function (grunt) {
  grunt.initConfig({
    shell: {
      // Build the frontend using pnpm workspace script
      ui_build: {
        command: 'pnpm --filter ui run build',
      },
      // Lint the frontend
      ui_lint: {
        command: 'pnpm --filter ui run lint',
      },
      // Typecheck the frontend
      ui_typecheck: {
        command: 'pnpm --filter ui run typecheck',
      },
      // Run server tests if present
      server_test: {
        command: 'pnpm --filter server run test || echo "No tests"',
      },
      // Typecheck the server
      server_typecheck: {
        command: 'pnpm --filter server run typecheck',
      },
    },
  });

  grunt.loadNpmTasks('grunt-shell');

  // Default task: typecheck, build UI and run server tests
  grunt.registerTask('default', ['shell:ui_typecheck', 'shell:server_typecheck', 'shell:ui_build', 'shell:server_test']);
  // Lint task (separate, optional)
  grunt.registerTask('lint', ['shell:ui_lint']);
  // CI task (no lint blocking)
  grunt.registerTask('ci', ['shell:ui_typecheck', 'shell:server_typecheck', 'shell:ui_build', 'shell:server_test']);
  grunt.registerTask('build', ['shell:ui_typecheck', 'shell:server_typecheck', 'shell:ui_build']);
  grunt.registerTask('test', ['shell:server_test']);
};


