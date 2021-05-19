const { src, dest, parallel, series, watch } = require('gulp');
const del = require('del');
const browserSync = require('browser-sync');
const bs = browserSync.create();

const loadPlugins = require('gulp-load-plugins');
const plugins = loadPlugins();

const cwd = process.cwd();
let config = {
  build: {
    src: 'src',
    dist: 'dist',
    temp: 'temp',
    public: 'public',
    paths: {
      styles: 'assets/styles/*.scss',
      scripts: 'assets/scripts/*.js',
      pages: '*.html',
      images: 'assets/images/**',
      fonts: 'assets/fonts/**',
      public: '**'
    }
  }
};

try{
  const loadConfig = require(`${cwd}/pages.config.js`);
  config = Object.assign({}, config, loadConfig);
}catch(err) {
  console.log(err);
}

const styles = () => {
  return src(config.build.paths.styles, { base: 'src', cwd: config.build.src })
    .pipe(plugins.sass({ outputStyle: 'expanded' }))
    .pipe(dest(config.build.temp))
    .pipe(bs.reload({ stream: true }));
}

const scripts = () => {
  console.log("scripts");
  return src(config.build.paths.scripts, { base: 'src', cwd: config.build.src })
    .pipe(plugins.babel({ presets: [require('@babel/preset-env')] }))
    .pipe(dest(config.build.temp))
    .pipe(bs.reload({ stream: true }));
}

const pages = () => {
  return src(config.build.paths.pages, { base: 'src', cwd: config.build.src })
    .pipe(plugins.swig({ data: config.data }))
    .pipe(dest(config.build.temp))
    .pipe(bs.reload({ stream: true }));
}

const images = () => {
  return src(config.build.paths.images, { base: 'src', cwd: config.build.src })
    .pipe(plugins.imagemin())
    .pipe(dest(config.build.dist))
}

const fonts = () => {
  return src(config.build.paths.fonts, { base: 'src', cwd: config.build.src })
    .pipe(plugins.imagemin())
    .pipe(dest(config.build.dist))
}

const extra = () => {
  return src('**', { base: 'src', cwd: config.build.public })
    .pipe(dest(config.build.dist));
}

const clean = () => {
  return del([config.build.dist])
}

const useref = () => {
  return src(config.build.paths.pages, { base: config.build.temp, cwd: config.build.temp })
    .pipe(plugins.useref({ searchPath: ['dist', '.'] }))
    .pipe(plugins.if(/\.js$/, plugins.uglify()))
    .pipe(plugins.if(/\.css$/, plugins.cleanCss()))
    .pipe(plugins.if(/\.html$/, plugins.htmlmin({
      collapseWhitespace: true,
      minifyCSS: true,
      minifyJS: true
    })))
    .pipe(dest(config.build.dist));
}

const server = () => {

  watch(config.build.paths.styles, {cwd: config.build.src}, styles);
  watch(config.build.paths.scripts, {cwd: config.build.src}, scripts);
  watch(config.build.paths.pages,{cwd: config.build.src}, pages);
  // watch('src/assets/images/**', images);
  // watch('src/assets/fonts/**', fonts);
  // watch('public/**', extra);
  watch([config.build.paths.images, config.build.paths.fonts],{cwd: config.build.src}, bs.reload);
  watch([config.build.paths.public,public, { cwd: config.build.public }], bs.reload);

  bs.init({
    notify: false,
    port: 8080,
    // files: 'dist/**',
    server: {
      baseDir: [config.build.temp, config.build.src, config.build.public],
      routes: {
        '/node_modules': 'node_modules'
      }
    }
  });
}

const compile = parallel(styles, scripts, pages, images, fonts);
const build = series(clean, parallel(compile, extra));
const release = series(clean, parallel(series(compile, useref), extra));
const dev = series(build, server);

module.exports = {
  clean,
  compile,
  dev,
  release
};