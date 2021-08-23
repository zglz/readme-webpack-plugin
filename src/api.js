const async = require('async');
const path = require('path');
const fs = require('fs');
const parser = require('../public/parser');
const utils = require('../public/utils');

function injectAPI(app,base,apiEmitter,original){

  app.get('/readmeData', (req, res) => {
    let basePath = path.resolve(process.cwd(), base+'.md')
    let response = {   
      baseData:base?utils.getBase(basePath):'',
      original
    }
    res.send(JSON.stringify(response));
  });

  app.post('/api/checkSource', (req, res) => {
    let filePath = path.resolve(process.cwd(), req.body.path) 
    fs.readFile(filePath, 'utf-8', function (err, data) {
      if(err){
        return res.status(404).json({msg: '操作失败'}).end()
      }else{
        if(req.body.hashCode !== utils.genHashCode(data)){
          return res.status(200).json({code:3, msg: '源码已更新', source:data }).end();
        }else{
          return res.status(200).json({code:0, msg: '' }).end();
        }
      }
    })
  });

  app.put('/api/source', (req, res) => {
    let filePath = path.resolve(process.cwd(), req.body.path) 
    fs.writeFile(filePath, req.body.source, { encoding: 'utf8' }, err => {
      apiEmitter.once('done', function() { 
        if(err){
          return res.status(404).json({msg: '操作失败'}).end()
        }else{
          res.json({msg: '操作成功'}).end()
        }
      }); 

    })
  });

  app.delete('/api/record',(req,res)=>{
    let data = req.body
    let fns = {}
    data.map((v)=>{
      let fn = function(callback){
        let filePath = path.resolve(process.cwd(), v.path) 
        fs.readFile(filePath, 'utf-8', function (err, data) {
          if(err){
            callback(new Error(),'任务一') 
          }else{
            if(v.hashCode !== utils.genHashCode(data)){
              return res.status(200).json({code:3, msg: '刷新页面' }).end();
            }else{
              let ast = parser.parse(data)
              parser.traverse(ast, function(node){
                if(v.tokenIndexs.includes(node.index)){
                  node.willDestroyed = true;
                }
              }); 
              let code = parser.codegen(ast)
              fs.writeFile(filePath, code, { encoding: 'utf8' }, err => {
                if(err){
                  callback(new Error(),'任务一') 
                }else{
                  callback(null,'任务一')
                }
              })
            }
          }
        });
      }
      fns[v.path] = fn
    }) 
    async.parallel(fns,function( err , data ){
      apiEmitter.once('done', function() { 
        if(err){
          return res.status(200).json({code:2,msg: '操作失败'}).end()
        }else{
          res.json({code:1,msg: '保存成功'}).end()
        }
      }); 
    })
  });

}
module.exports = injectAPI;
