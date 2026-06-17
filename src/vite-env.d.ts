/// <reference types="vite/client" />

declare module 'ali-oss';
declare module 'cos-js-sdk-v5';
// mathjax/es5/tex-svg.js 是浏览器自执行脚本，无 TS 类型，声明为副作用导入
declare module 'mathjax/es5/tex-svg.js'
