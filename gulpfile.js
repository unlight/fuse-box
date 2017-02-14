const gulp = require('gulp')
const rename = require('gulp-rename');

const replace = require('gulp-replace');
const ts = require('gulp-typescript');
const concat = require('gulp-concat');
const fs = require('fs');
const sourcemaps = require('gulp-sourcemaps');
const runSequence = require('run-sequence');
const bump = require('gulp-bump');
const child_process = require('child_process');
const spawn = child_process.spawn;
const wrap = require('gulp-wrap');
const uglify = require('gulp-uglify');

let projectTypings = ts.createProject('src/tsconfig.json');
let projectCommonjs = ts.createProject('src/tsconfig.json', {
    target: 'es6',
});

let projectFrontend = ts.createProject('src-frontend/tsconfig.json', {

});
gulp.task('src-frontend', () => {
    return gulp.src('src-frontend/**/*.ts')
        .pipe(projectFrontend()).js
        .pipe(wrap('(function(__root__){ <%= contents %> \nreturn __root__["FuseBox"] = FuseBox; } )(this)'))
        .pipe(rename('fusebox.js'))
        .pipe(gulp.dest('assets/frontend'))
        .pipe(rename('fusebox.min.js'))
        .pipe(uglify())
        .pipe(replace(/;$/, ''))
        .pipe(replace(/^\!/, ''))
        .pipe(gulp.dest('assets/frontend'))

})


gulp.task('publish', function(done) {
    runSequence('dist', 'increment-version', 'commit-release', 'npm-publish', done);
})

gulp.task('increment-version', function() {
    return gulp.src('./package.json')
        .pipe(bump())
        .pipe(gulp.dest('./'));
});
gulp.task('commit-release', function(done) {
    let json = JSON.parse(fs.readFileSync(__dirname + '/package.json').toString());
    child_process.exec(`git add .; git commit -m "Release ${json.version}" -a; git tag v${json.version}; git push origin master --tags`, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);
        done();
    });
});
gulp.task('npm-publish', function(done) {
    var publish = spawn('npm', ['publish'], {
        stdio: 'inherit'
    })
    publish.on('close', function(code) {
        if (code === 8) {
            gulp.log('Error detected, waiting for changes...');
        }
        done()
    });
});
gulp.task('commit', ['dist', 'minify-frontend'], function(done) {
    const readline = require('readline');

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question('What are the updates? ', (text) => {
        // TODO: Log the answer in a database
        child_process.exec(`git add .; git commit -m "${text}" -a; git push origin master`, (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                return;
            }
            console.log(`stdout: ${stdout}`);
            console.log(`stderr: ${stderr}`);
            done();
        });

        rl.close();
    });
});

gulp.task('dist-typings', () => {
    let result = gulp.src('src/**/*.ts')
        .pipe(projectTypings());
    return result.dts.pipe(gulp.dest('dist/typings'));
});

gulp.task('dist-commonjs', () => {
    let result = gulp.src('src/**/*.ts')
        .pipe(sourcemaps.init())
        .pipe(projectCommonjs());
    return result.js.pipe(gulp.dest('dist/commonjs'));
});

let node;

gulp.task('hello', function() {
    if (node) node.kill()
    node = spawn('node', ['hello.js'], {
        stdio: 'inherit'
    })
    node.on('close', function(code) {
        if (code === 8) {
            gulp.log('Error detected, waiting for changes...');
        }
    });
});

gulp.task('minify-frontend', function() {
    return gulp.src('assets/fusebox.js')
        .pipe(uglify())
        .pipe(rename('fusebox.min.js')).pipe(gulp.dest('assets/'))
});

gulp.task('watch', ['dist-commonjs', 'src-frontend'], function() {

    gulp.watch(['src-frontend/**/*.ts'], () => {
        runSequence('src-frontend');
    });


    // gulp.watch(['assets/**/*.js'], () => {
    //     runSequence('hello');
    // });

    gulp.watch(['src/**/*.ts'], () => {
        runSequence('dist-commonjs');
    });
});


gulp.task('uglify-test', function() {
    return gulp.src('./out.js')
        .pipe(uglify())
        .pipe(rename('out.min.js')).pipe(gulp.dest('./'))
});

gulp.task('dist', ['dist-typings', 'dist-commonjs', 'src-frontend'], function() {

});