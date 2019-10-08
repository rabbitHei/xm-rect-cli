#!/usr/bin/env node

const validateProjectName = require('validate-npm-package-name')
const chalk = require('chalk');
const ora = require('ora');
const path = require('path');
const fs = require('fs-extra');
const figlet = require('figlet');
const inquirer = require('inquirer');
const spawn = require('cross-spawn');
const download = require('download-git-repo');
const commander = require('commander');

const packageJson = require('./package.json');

const errorLogFilePatterns = [
  'npm-debug.log',
  'yarn-error.log',
  'yarn-debug.log',
];

const templateList = [
  // chalk.magenta('react + react-router + axios'),
  chalk.magenta('react + react-router + axios (H5版, vw适配)'),
  chalk.magenta('react + react-router + axios (H5版, vw适配, mobx)'),
  chalk.magenta('react + react-router + axios + antd'),
  // chalk.magenta('react + react-router + axios + redux'),
  // chalk.magenta('react + react-router + axios + mobx'),
]

let projectName;

commander
  .version(packageJson.version, '-v --version')
  .option('-g --glad', 'yes, you are happy ')
  .arguments('<project-directory>')
  .usage(`${chalk.green('<project-directory>')} [options]`)
  .action(name => {
    projectName = name;
  })
  .allowUnknownOption()
  .on('--help', () => {
    console.log()
    console.log(`Only ${chalk.green('<project-directory>')} is required.`)
    console.log()
  })  

commander.parse(process.argv);


if(typeof projectName === 'undefined') {
  console.error('Please specify the project directory:');
  console.log();
  console.log(`${chalk.cyan('rect')} ${chalk.green('<project-directory>')}`);
  console.log();
  console.log('For example:');
  console.log(`${chalk.cyan('rect')} ${chalk.green('my-project')}`);
  console.log();
  console.log(`Run ${chalk.cyan(`${'rect'} --help`)} to see all options.`);
  process.exit(1);
}


createApp(projectName)

function createApp(name) {
  // 获取创建文件夹的根目录
  const root = path.resolve(name);
  const appName = path.basename(root)
  const promptList = [{
    type: 'list',
    message: chalk.cyan('请选择一种模板类型:'),
    name: 'type',
    choices: templateList
  }]
  inquirer.prompt(promptList).then(answer => {
    let repoUrl
    const { type } = answer
    if(type.indexOf('antd') > -1){
      repoUrl = 'direct:https://github.com/rabbitHei/react-antd-template.git'
    }else if(type.indexOf('mobx') > -1){
      repoUrl = 'direct:https://github.com/rabbitHei/react-vw-mobx-template.git'
    }else if(type.indexOf('H5') > -1){
      repoUrl = 'direct:https://github.com/rabbitHei/react-vw-template.git'
    }else{
      // 使用默认模板antd
      repoUrl = 'direct:https://github.com/rabbitHei/react-antd-template.git'
    }

    // 创建之前校验应用名以符合规则
    checkAppName(appName)
    fs.ensureDirSync(name)
    // 将当前node执行环境指向创建的文件夹
    process.chdir(root)
    if(!isSafeToCreateProjectIn(root, name)){
      process.exit(1)
    }
    run(root, appName, repoUrl)

  })

}


function run(root,appName, repoUrl) {
  const spinner = ora(`${chalk.cyan('downloading template')}`).start()
  download(
    repoUrl,
    root,
    {clone: true},
    function(err){
      if(err){
        console.log(
          chalk.red(` Failed to download repo template: ${err.message}`)
        )
        spinner.stop()
        process.exit(1)
      }
      spinner.succeed()
      console.log(chalk.magenta('template download successfully'))
      // install dependencies
      console.log('🚀 Installing dependencies...');
      const childProcess = spawn('npm', ['install'], {
        stdio: 'inherit'
      })
      childProcess.on('close', code => {
        console.log(code)
        if (code !== 0) {
          console.log('Installing failed \n');
          console.log(
            `Deleting generated folder... ${chalk.cyan('node_modules')}`
          );
          fs.removeSync(path.join(root, 'node_modules'));
        }
        console.log(`🎉 Success! Created ${appName} at ${process.cwd()}`);
        console.log();
        console.log(`now ${chalk.cyan(`cd ${appName}`)} in to project!`)
        console.log('Inside directory, you can run several commands:');
        console.log();
        console.log(chalk.cyan(`  npm start`));
        console.log(' Starts the development server.');
        console.log();
        console.log(chalk.cyan(`  npm run build:pro`));
        console.log(' Bundles the app into static files for production.');
        console.log();
        console.log(chalk.cyan(`  npm run build`));
        console.log(' Bundles the app into static files for production.');
        console.log();
        console.log('✨ Happy hacking!');
        console.log()
        console.log(
          chalk.yellow(figlet.textSync('xm-rect-cli', { horizontalLayout: 'full' }))
        )
      })
    }
  )
}





function checkAppName(appName) {
  const validationResult = validateProjectName(appName);
  if (!validationResult.validForNewPackages) {
    console.error(
      `Could not create a project called ${chalk.red(
        `"${appName}"`
      )} because of npm naming restrictions:`
    );
    printValidationResults(validationResult.errors);
    printValidationResults(validationResult.warnings);
    process.exit(1);
  }

  // TODO: there should be a single place that holds the dependencies
  const dependencies = ['react', 'react-dom', 'react-scripts'].sort();
  if (dependencies.indexOf(appName) >= 0) {
    console.error(
      chalk.red(
        `We cannot create a project called ${chalk.green(
          appName
        )} because a dependency with the same name exists.\n` +
          `Due to the way npm works, the following names are not allowed:\n\n`
      ) +
        chalk.cyan(dependencies.map(depName => `  ${depName}`).join('\n')) +
        chalk.red('\n\nPlease choose a different project name.')
    );
    process.exit(1);
  }
}

function isSafeToCreateProjectIn(root, name) {
  const validFiles = [
    '.DS_Store',
    'Thumbs.db',
    '.git',
    '.gitignore',
    '.idea',
    'README.md',
    'LICENSE',
    '.hg',
    '.hgignore',
    '.hgcheck',
    '.npmignore',
    'mkdocs.yml',
    'docs',
    '.travis.yml',
    '.gitlab-ci.yml',
    '.gitattributes',
  ];
  console.log();

  const conflicts = fs
    .readdirSync(root)
    .filter(file => !validFiles.includes(file))
    // IntelliJ IDEA creates module files before CRA is launched
    .filter(file => !/\.iml$/.test(file))
    // Don't treat log files from previous installation as conflicts
    .filter(
      file => !errorLogFilePatterns.some(pattern => file.indexOf(pattern) === 0)
    );

  if (conflicts.length > 0) {
    console.log(
      `The directory ${chalk.green(name)} contains files that could conflict:`
    );
    console.log();
    for (const file of conflicts) {
      console.log(`  ${file}`);
    }
    console.log();
    console.log(
      'Either try using a new directory name, or remove the files listed above.'
    );

    return false;
  }

  // Remove any remnant files from a previous installation
  const currentFiles = fs.readdirSync(path.join(root));
  currentFiles.forEach(file => {
    errorLogFilePatterns.forEach(errorLogFilePattern => {
      // This will catch `(npm-debug|yarn-error|yarn-debug).log*` files
      if (file.indexOf(errorLogFilePattern) === 0) {
        fs.removeSync(path.join(root, file));
      }
    });
  });
  return true;
}









