## rect-cli  
用于快速创建React项目的脚手架，真正开箱即用直接进行业务开发，目前涵盖下面几种常见业务场景：  
- react + react-router + axios(h5版本, vw适配,包涵SDK 埋点)  
- react + react-router + axios + antd  (OPS 后台)
- 详细文档可见拉下来的项目中 readMe.md

## 使用  
```sh
// 全局安装
npm install -g xm-rect-cli

// 新建一个项目
rect myProjectName

//配置package.json
"name": "xxx",
"homepage":{
    "pro":"线上静态源域名(//www.xxx.com/build/)",
    "uat":"线上静态源域名(//www.uat.com/build/)",
    "test":"测试静态源域名(//www.test.xxx.com/build/)"  
},
"xpm3": {
    "rep": "sr012018" or "xpm-publish", //默认使用sr012018 新发布源
    "output": "build/",//xpm3默认打包到dist目录    
},

//配置拆包功能 config/webpack.config.js 默认不使用
    //**** 拆包功能
    // splitChunks: {
    //   chunks: "all",
    //   name: false,
    //   cacheGroups: {
    //       reactModules: {
    //         test:  /[\\/]node_modules[\\/](react|react-dom|react-router-dom)[\\/]/,
    //         name:'reactModules',
    //         chunks: "all",
    //         minChunks: 1,
    //         priority: 2,
    //         // reuseExistingChunk: true,
    //       },
    // },
    //**** 拆包功能

// 启动
cd myProjectName
npm start

// 打包
npm run build
npm run build:uat uat打包
npm run build:pro 线上打包
```