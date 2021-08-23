const parser = require('./parser');
const _ = require('lodash');

let typeColorMap = {
  todo:'DodgerBlue',
  component:'DodgerBlue',
  tag:'Chocolate',
  feature:'Chocolate'
}

let blockTreeDefault = {}
Object.keys(typeColorMap).map((key)=>{
  blockTreeDefault[key] = []
})

function format(tokens){
  let blocks = []
  let blockP = []
  let blockC = []
  let error = null;

  blocks = tokens.filter((token)=>{
    return token.mark?true:false
  })

  blocks.map((block)=>{
    block.mark.type = block.mark.type.toLowerCase()
    if(block.mark.pid){
      blockC.push(block)
    }else{
      blockP.push(block)
    }
  })

  blockP = _.sortBy(blockP, function(item) {
    return Number(item.mark.id);
  });

  blockP.map((p)=>{
    blockC.map((c)=>{
      if(Number(p.mark.id)===Number(c.mark.pid||10000000)){
        p.mark.children.push(c)
        c.mark.parent.push(p)
      }
    })
    p.mark.children = _.sortBy(p.mark.children, function(item) {
      return Number(item.mark.id);
    });
  })
  blockC.map((c)=>{
    if(c.mark.parent.length > 1){
      error=c.mark.parent[0].mark.id
    }
  })
  blockP = _.groupBy(blockP, function (n) { return n.mark.type; }); 
  return {blockTree:{...blockTreeDefault,...blockP},error}
}

function serverAnalyzer(data){
  let result = []
  Object.keys(data).map((key)=>{
    let value = data[key]
    let ast = parser.parse(value)
    ast.map((t)=>{ 
      t.path = key 
    })
    result = result.concat(ast)
  })
  return format(result)
}

function staticAnalyzer(data){
  let ret = ""
  let {blockTree,error} = serverAnalyzer(data)
  Object.keys(blockTree).map((key,i)=>{
    let ps = blockTree[key]
    ps.map((p)=>{
      let titleP =  `\n## <font color=${typeColorMap[p.type]} face="">${p.mark.id} - ${p.mark.type} - ${p.mark.title} - ${p.path}</font>`
      let contP =  `\n#${p.mark.content}`
      ret = ret+titleP+contP
      if(p.mark.children.length){
        p.mark.children.map((c,i)=>{
          let titleC =  `\n${i+1}. <font color=${typeColorMap[c.mark.type]} face="">${c.mark.id} - ${c.mark.type} - ${c.mark.title} - ${c.path}</font>`
          let contC =  `\n>${c.mark.content}`
          ret = ret+titleC+contC
        })
      }
    })
    ret =  `${ret}`
  })
  return { markdownStr:ret , error}
}

module.exports = {serverAnalyzer,staticAnalyzer,typeColorMap};