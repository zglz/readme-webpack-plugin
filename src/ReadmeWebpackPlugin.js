const Logger = require('./Logger.js');
const viewer = require('./viewer.js');
const events = require('events');

class ReadmeWebpackPlugin {
  constructor(opts) {
    this.opts = {
      base:'',
      mode:'server',
      server:{
       host:'localhost',
       port: 80,
      },
      open:true,
      output:{
         filename:''
      },
      ...opts
    };

    this.server = null;
    this.logger = new Logger(this.opts.logLevel);
    this.apiEmitter = new events.EventEmitter();
  }

  apply(compiler) {
    this.compiler = compiler;
    const done = stats => {
      const actions = [];
      if (this.opts.mode === 'server') {
        actions.push(() => this.startAnalyzerServer(stats.compilation.compiler.readmeOriginalMap));
      } else if (this.opts.mode === 'static') {
        actions.push(() => this.generateMarkdown(stats.compilation.compiler.readmeOriginalMap));
      }
      if (actions.length) {
        setImmediate(() => {
          actions.forEach(action => action());
        });
      }
      this.apiEmitter.emit('done');
    };

    if (compiler.hooks) {
      compiler.hooks.done.tap('readme-webpack-plugin', done);
    } else {
      compiler.plugin('done', done);
    }

  }
  async generateMarkdown(modules) {
    viewer.generateMarkdown(modules,{
      base: this.opts.base,
      filename: this.opts.output.filename,
      logger: this.logger
    });
  }
  async startAnalyzerServer(modules) {
    if (this.server) {
    } else {
      this.server = viewer.startServer(modules, {
        base: this.opts.base,
        openBrowser: this.opts.open,
        host: this.opts.server.host,
        port: this.opts.server.port,
        logger: this.logger,
        apiEmitter: this.apiEmitter
      });
      // 需要改
      // ['SIGINT', 'SIGTERM'].forEach((sig) => {
      //   process.on(sig, () => {
      //     // this.server.close(() => {
      //     //   // process.exit(); // eslint-disable-line no-process-exit
      //     // });
      //   });
      // });
    }
  }
}

module.exports = ReadmeWebpackPlugin;
