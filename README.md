## rect-cli  
用于快速创建React项目的脚手架，真正开箱即用直接进行业务开发，目前涵盖下面几种常见业务场景：  
- react + react-router + axios(h5版本，vw适配)  
- react + react-router + axios + antd  


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

// 启动
cd myProjectName
npm start

// 打包
npm run build
npm run build:uat uat打包
npm run build:pro 线上打包
```