const path = require('path');
const fs = require('fs');
const http = require('http');
const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const opener = require('opener');
const { bold } = require('chalk');
const Logger = require('./Logger');
const analyzer = require('../public/analyzer');
const injectAPI = require('./api');
const portfinder = require('portfinder')
const utils = require('../public/utils');

const projectRoot = path.resolve(__dirname, '..');

module.exports = {
  startServer,
  generateMarkdown,
};

async function startServer(original, opts) {
  const {
    base,
    port,
    host,
    openBrowser,
    apiEmitter,
    logger,
  } = opts || {};
  
  const app = express();
  app.use(bodyParser.urlencoded({extended: true}))
  app.use(bodyParser.json());

  app.engine('ejs', require('ejs').renderFile);
  app.set('view engine', 'ejs');
  app.set('views', `${projectRoot}/views`);
  app.use(express.static(`${projectRoot}/client-dist`));

  injectAPI(app , base, apiEmitter, original)

  app.use('/', (req, res) => {
    res.render('viewer', {
      mode: 'server'
    });
  });

  const server = http.createServer(app);

  await new Promise(resolve => {

    portfinder.basePort = port
    portfinder.getPort((err, port) => {
      if (err) {
        reject(err)
      } else {
        server.listen(port, host, () => {
          resolve();
          const url = `http://${host}:${server.address().port}`;
          logger.info(
            `${bold('Readme Server')} is started at ${bold(url)}\n` +
            `Use ${bold('Ctrl+C')} to close it`
          );
          if (openBrowser) {
            opener(url);
          }
        });
      }
    })
  });

  return server
}

function generateMarkdown(original, opts) {
  const {
    base,
    filename,
    logger,
  } = opts || {};

  let basePath = path.resolve(process.cwd(), base+'.md')
  let baseData = base?utils.getBase(basePath):''
  
  let { markdownStr , error} = analyzer.staticAnalyzer(original)
  let staticData = baseData + markdownStr
  let filePath = path.resolve(process.cwd(), filename) 
  fs.writeFile(filePath, staticData, { encoding: 'utf8' }, err => {
    if (err) return logger.error(err);
    logger.info(
        `${bold('Readme Plugin')} saved markdown to ${bold(filename)}`
    );
  })
}






