var gulp = require("gulp");
var jshint = require("gulp-jshint");
var sh = require("shelljs");
var karma = require("karma").server;
var bump = require("gulp-bump");
var print = require("gulp-print"),
  runSequence = require("run-sequence"),
  uglify = require("gulp-uglify"),
  clean = require("gulp-clean"),
  uglifyCss = require("gulp-minify-css"),
  jade = require("gulp-jade");
const zhCN = require("./locales/zh");

gulp.task("jshint", function() {
  gulp
    .src(["./www/js/**/*.js", "./tests/**/*.js"])
    .pipe(jshint())
    .pipe(jshint.reporter("jshint-stylish"))
    .pipe(jshint.reporter("fail"));
});

gulp.task("mocha", function(done) {
  sh.exec("mocha", done);
});

gulp.task("start", function(done) {
  sh.exec("node app.js", done);
});

gulp.task("test", function(done) {
  karma.start(
    {
      configFile: __dirname + "/tests/karma.conf.js",
      singleRun: true
    },
    done
  );
});

gulp.task("bump", function() {
  gulp
    .src(["./package.json", "./bower.json"])
    .pipe(bump())
    .pipe(gulp.dest("./"));
});

gulp.task("release", function(done) {
  return runSequence("jshint", "bump", "build", done);
});

gulp.task("default", function(done) {
  return runSequence("clean", "mocha", "test", "jadeTemplate", "start", done);
});

gulp.task("heroku", function(done) {
  return runSequence(
    "clean",
    "jadeTemplate",
    "jadeIndex",
    "copy",
    "copy-locales",
    "uglify-js",
    "uglify-css",
    done
  );
});

gulp.task("replace", function(done) {
  var replace = require("gulp-replace");

  gulp
    .src(["public/semantic/dist/semantic.min.css"])
    //.pipe(replace(/https:\/\/fonts.googleapis.com\/css/g, 'http://fonts.useso.com/css'))
    .pipe(replace(/https:\/\/fonts.googleapis.com\/css/g, ""))
    .pipe(gulp.dest("public/semantic/dist/"));

  done();
});

gulp.task("clean", function(done) {
  return gulp.src(["dist", "public/templates"], { read: false }).pipe(clean());
});

gulp.task("copy", function(done) {
  return gulp.src(["public/**/*"]).pipe(gulp.dest("dist/"));
});

gulp.task("copy-locales", function(done) {
  return gulp.src(["locales/**/*"]).pipe(gulp.dest("dist/"));
});

gulp.task("uglify-js", function(done) {
  return gulp
    .src("public/scripts/*.js")
    .pipe(uglify())
    .pipe(gulp.dest("dist/scripts"));
});

gulp.task("uglify-css", function(done) {
  return gulp
    .src("public/stylesheets/*.css")
    .pipe(uglifyCss())
    .pipe(gulp.dest("dist/stylesheets"));
});

gulp.task("jadeTemplate", function(done) {
  var jadeFiles = [
    {
      src: "./views/templates/stats.jade",
      dest: "./public/templates/"
    }
  ];

  return runJade(jadeFiles, done);
});

function runJade(jadeFiles, done) {
  const jf = jadeFiles[0];

  if (!jf.src || !jf.dest) return;

  return gulp
    .src(jf.src)
    .pipe(
      jade({
        locals: {
          __: function(key) {
            return zhCN[key];
          }
        }
      })
    )
    .pipe(gulp.dest(jf.dest));
}

gulp.task("jade", function(done) {
  var jadeFiles = [
    {
      src: "./views/index.jade",
      dest: "./public/"
    },
    {
      src: "./views/templates/stats.jade",
      dest: "./public/templates/"
    }
  ];

  return runJade(jadeFiles, done);
});

gulp.task("jadeIndex", function(done) {
  const jadeFiles = [
    {
      src: "./views/index.jade",
      dest: "./public/"
    }
  ];

  return runJade(jadeFiles, done);
});

gulp.task("build", function(done) {
  runSequence(
    "jshint",
    "mocha",
    "clean",
    /*'jade', */ "copy",
    "uglify-js",
    "uglify-css",
    done
  );
});
