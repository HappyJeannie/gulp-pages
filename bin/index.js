#!/usr/bin/env node
// 使用 gulp-cli 指令在无 gulpfile.js 的情况下直接加载 node_modules/gulp-pages/lib/index.js 中的配置文件
// yarn gulp build --gulpfile ./node_modules/gulp-pages/lib/index.js
// 此时当前执行目录变更到了 gulp-pages 下，需要在上述指令中增加当前路径配置，增加指令 --cwd .
// 此处也是为了模拟 gulp-cli 的指令
console.log(process.argv);
// 增加参数
process.argv.push('--cwd');
process.argv.push(process.cwd());
process.argv.push('--gulpfile');
process.argv.push(require.resolve('..'));
console.log('hello gulp-pages');

// 执行指令
require('gulp/bin/gulp');