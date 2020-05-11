// инициализируем константу gulp измодулей node_modeles.
const gulp  = require('gulp');
const browserSync = require('browser-sync').create();
const watch = require('gulp-watch');
const less = require('gulp-less');
const scss = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps = require('gulp-sourcemaps'); // показывает
// исходные карты
const notify = require('gulp-notify'); // вывыодит инфу об ошибках
const plumber = require('gulp-plumber'); // отлавливает ошибки
const fileinclude = require('gulp-file-include');
const htmlValidator = require('gulp-w3c-html-validator');
const through2 = require('through2');

scss.compiler = require('node-sass');

// валидатор html
gulp.task('htmlValidor', function (callback) {
  const handleFile = (file, encoding, callback) => {
    callback(null, file);
    if (!file.w3cjs.success)
      console.log('User >>> ERROR validation - @@@@@  DANGER!!!!' +
        ' @@@@@' );
    };
  return gulp.src('./app/*.html')
    .pipe(htmlValidator())
    .pipe(through2.obj(handleFile));
  callback();
})

// шаблонизатор для html временно отключен
gulp.task('html',  function (callback) {
  // подключить данный код для возможности писать шаблоны
  // return gulp.src('./app/html/**/*.html')
  //   .pipe(plumber({
  //     errorHandler: notify.onError(function (err) {
  //       return{
  //         title: 'HTML include',
  //         sound: false,
  //         message: err.message
  //       }
  //     })
  //   }))
  //   .pipe(fileinclude({prefix: '@@'}))
  //   .pipe(gulp.dest('./app/'))
  callback()
});

//вызывает валидатор и сборку шаблонов
gulp.task('html_htmlValidator', gulp.series('html', 'htmlValidor'));

// Таск для компиляции SCSS в css
gulp.task('scss', async function () {
    return gulp.src('./app/scss/*.scss')
      .pipe(plumber({
        errorHandler: notify.onError(function (err) {
          return{
            title: 'Styles',
            sound: false,
            message: err.message
          }
        })
      }))
      .pipe(sourcemaps.init() )
      .pipe(scss())
      .pipe(autoprefixer({
          overrideBrowserslist: ['last 4 versions']
      }))
      .pipe(sourcemaps.write())
      .pipe(gulp.dest('./app/css/'))
});

// Таск для компиляции Less в css
gulp.task('less', async function () {
    return gulp.src('./app/less/*.less')
       .pipe(plumber({ //обработка ошибок
         errorHandler: notify.onError(function (err) {
           return{
             title: 'Styles',
             sound: false,
             message: err.message
           }
         })
       }))
      .pipe(sourcemaps.init() ) // инициализирует строки стилей
      // для панели инструментов
      .pipe(less()) // компиляция
      .pipe(autoprefixer({ // подставим префиксы
          overrideBrowserslist: ['last 4 versions']
      }))
      .pipe(sourcemaps.write()) // запишет эту инфу в css
      .pipe(gulp.dest('./app/css/')) // создаст или перезапишет файл
});

// настройка watch для отслеживания изменений файлов
gulp.task('watch', function () {
  // watch('./app/html/**/*.html', gulp.parallel('html_htmlValidator'));
  watch('./app/**/*.html', gulp.parallel('html_htmlValidator'));
  watch(['./app/css/**/*.css',
        './app/js/**/*.js',
        './app/js/**/*.css',
        './app/*.html',], gulp.parallel(browserSync.reload));
  watch('./app/less/**/*.less', gulp.parallel('less'));
  watch('./app/scss/**/*.scss', gulp.parallel('scss'));
});

// задача для старта сервера
gulp.task('serve', function () {
    browserSync.init({
        server: {
            baseDir: './app/'
        }
    })
});

// стандартный таск => запустить gulp без параметров
gulp.task('default', gulp.parallel('serve', 'watch', 'scss', 'less','html', 'htmlValidor'))


