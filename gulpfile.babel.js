'use strict';

import plugins  from 'gulp-load-plugins';
import yargs    from 'yargs';
import browser  from 'browser-sync';
import merge    from 'merge-stream';
import gulp     from 'gulp';
import rimraf   from 'rimraf';
import yaml     from 'js-yaml';
import fs       from 'fs';
import path     from 'path';
// import sherpa   from 'style-sherpa';
// import panini   from 'panini';

// Themes path
const themesPath = "jet/static/jet_src/scss/themes/";

// Load all Gulp plugins into one variable
const $ = plugins();

// Check for --production flag
const PRODUCTION = !!(yargs.argv.production);

// Load settings from settings.yml
const {COMPATIBILITY, PORT, UNCSS_OPTIONS, PATHS} = loadConfig();

function loadConfig() {
    let ymlFile = fs.readFileSync('config.yml', 'utf8');
    return yaml.load(ymlFile);
}

function getFolders(dir) {
    return fs.readdirSync(dir)
        .filter(function (file) {
            return fs.statSync(path.join(dir, file)).isDirectory();
        });
}

// Build the "dist" folder by running all of the below tasks
gulp.task('build', gulp.series(clean, gulp.parallel(sass, javascript, images, fonts)));

// Build the site, run the server, and watch for file changes
gulp.task('default', gulp.series('build', server, watch));

// Delete the "dist" folder
// This happens every time a build starts
function clean(done) {
    rimraf(PATHS.dist, done);
}

// Compile Sass into CSS
// In production, the CSS is compressed
function sass() {
    var folders = getFolders(themesPath);
    return merge.apply(null, folders.map(folder => {
        return gulp.src(path.join(themesPath, folder, '/**/*.scss'))
            .pipe($.sourcemaps.init())
            .pipe($.sass({
                includePaths: PATHS.sass
            })
                .on('error', $.sass.logError))
            .pipe($.autoprefixer({
                browsers: COMPATIBILITY
            }))
            // Comment in the pipe below to run UnCSS in production
            .pipe($.if(PRODUCTION, $.uncss(UNCSS_OPTIONS)))
            .pipe($.if(PRODUCTION, $.cssnano()))
            .pipe($.if(!PRODUCTION, $.sourcemaps.write()))
            .pipe(gulp.dest(PATHS.dist + '/css/themes/' + folder))
            .pipe(browser.reload({stream: true}));
    }));
}

// Combine JavaScript into one file
// In production, the file is minified
function javascript() {
    var js = gulp.src(PATHS.javascript)
        .pipe($.sourcemaps.init())
        .pipe($.babel())
        .pipe($.concat('main.js'))
        .pipe($.if(PRODUCTION, $.uglify()
            .on('error', e => {
                console.log(e);
            })
        ))
        .pipe($.if(!PRODUCTION, $.sourcemaps.write()))
        .pipe(gulp.dest(PATHS.dist + '/js'));

    var libs = gulp.src(PATHS.libraries)
        .pipe($.sourcemaps.init())
        .pipe($.babel())
        .pipe($.concat('libraries.js'))
        .pipe($.if(PRODUCTION, $.uglify()
            .on('error', e => {
                console.log(e);
            })
        ))
        .pipe($.if(!PRODUCTION, $.sourcemaps.write()))
        .pipe(gulp.dest(PATHS.dist + '/js'));

    return merge(js, libs);
}

// Copy images to the "dist" folder
// In production, the images are compressed
function images() {
    return gulp.src(PATHS.sources + '/img/**/*')
        .pipe($.if(PRODUCTION, $.imagemin({
            progressive: true
        })))
        .pipe(gulp.dest(PATHS.dist + '/img'));
}

// Copy fonts to the "dist" folder
function fonts() {
    return gulp.src(PATHS.fonts)
        .pipe(gulp.dest(PATHS.dist + '/fonts'));
}

// Start a server with BrowserSync to preview the site in
function server(done) {
    browser.init({
        server: PATHS.dist, port: PORT
    });
    done();
}

// Reload the browser with BrowserSync
function reload(done) {
    browser.reload();
    done();
}

// Watch for changes to static assets, Sass, and JavaScript
function watch() {
    gulp.watch(PATHS.sources + '/scss/**/*.scss', sass);
    gulp.watch(PATHS.sources + '/js/**/*.js').on('change', gulp.series(javascript, browser.reload));
    gulp.watch(PATHS.sources + '/img/**/*').on('change', gulp.series(images, browser.reload));
    gulp.watch(PATHS.sources + '/fonts/**/*').on('change', gulp.series(fonts, browser.reload));
}
