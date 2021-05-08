#!/usr/bin/env node

const fs = require('fs');
const program = require('commander');
const download = require('download-git-repo');
const handlebars = require('handlebars');
const inquirer = require('inquirer');
const ora = require('ora');
const chalk = require('chalk');
const symbols = require('log-symbols');
const types = require('../config/template');
 program
  .version('0.0.1', '-v, --version')
  .command('init <type> <name>')
  .action((type, name) => {
    if (fs.existsSync(name)) {
      // 错误提示项目已存在，避免覆盖原有项目
      console.log(symbols.error, chalk.red('项目已存在'));
      return;
    }
    const currentType = types[type];
    if (!currentType) {
      // 错误提示模板不存在
      console.log(symbols.error, chalk.red('模板不存在'));
      return;
    }
     const writePackage = [
      {
        name: 'name',
        message: `请输入项目名称`,
        default: name
      },
      {
        name: 'version',
        message: '请输入项目描述',
        default: '1.0.0'
      },
      {
        name: 'description',
        message: `请输入项目描述`,
        default: `${type} project`
      },
      {
        name: 'author',
        message: '请输入作者名称',
        default: name
      }
    ];
     inquirer.prompt(writePackage).then(answers => {
      const spinner = ora(`正在下载模板${currentType.url} ...`);
      spinner.start();
      download(currentType.download, `${name}`, err => {
        if (err) {
          spinner.fail();
          console.log(symbols.error, chalk.red(err));
        } else {
          spinner.succeed();
          const fileName = `${name}/package.json`;
          const meta = {
            name: answers.name,
            version: answers.version,
            description: answers.description,
            author: answers.author
          };
          if (fs.existsSync(fileName)) {
            const content = fs.readFileSync(fileName).toString();
            const result = handlebars.compile(content)(meta);
            fs.writeFileSync(fileName, result);
          }
          console.log(symbols.success, chalk.green(`项目初始化完成`));
          console.log(chalk.blue(`cd ${name}`));
          console.log(chalk.blue(`yarn / npm install`));
        }
      });
    });
  });
 program.parse(process.argv);
if (program.args.length == 0) {
  //这里是处理默认没有输入参数或者命令的时候，显示help信息
  program.help();
}