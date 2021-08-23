let blockStart = '/*####'
let blockEnd = '####*/'
let HTMLBlockStart = '<!--##'
let HTMLBlockEnd = '###-->'
let blockStartReg = /\/\*####/
let blockEndReg = /####\*\//
let HTMLBlockStartReg = /<!--##/
let HTMLBlockEndReg = /###-->/
let titleStart = '#{'
let titleEnd = '}#'
let titleStartReg = /#{/
let titleEndReg = /}#/

function Parser(code){
  this.code = code
  this.tokens = []
  this.index = 0
  this.actualIindex = 0
}

Parser.prototype.run = function(){
  let startIndex=null;
  let endIndex=null;
  let JSStartIndex = this.code.search(blockStartReg)
  let HTMLStartIndex = this.code.search(HTMLBlockStartReg)
  // HTMLStartIndex>-1?HTMLStartIndex:(JSStartIndex>-1?JSStartIndex:-1)
  startIndex = HTMLStartIndex>-1?HTMLStartIndex:(JSStartIndex>-1?JSStartIndex:-1)
  if(startIndex>-1){
    // process common code
    this.parseNormal(startIndex)
    this.advance(startIndex)
    let JSEndIndex = this.code.search(blockEndReg)
    let HTMLEndIndex = this.code.search(HTMLBlockEndReg)
    // endIndex = (JSEndIndex<HTMLEndIndex&&JSEndIndex>-1)?HTMLEndIndex:JSEndIndex
    endIndex = HTMLEndIndex>-1?HTMLEndIndex:(JSEndIndex>-1?JSEndIndex:-1)
    let block = this.code.slice(0,endIndex+6)
    this.parseBlock(block,endIndex+6)
  }else if(this.code.length>0){
    this.parseNormal(this.code.length)
  }
}

Parser.prototype.continue = function(){
  this.run()
}

Parser.prototype.advance = function(ipos){
  this.code = this.code.substring(ipos,this.code.length)
  this.actualIindex = this.actualIindex+ipos
}

Parser.prototype.parseBlock = function(block,blockEndIndex){
  let startIndex = block.search(titleStartReg)
  let endIndex = block.search(titleEndReg)
  let summary = this.code.slice(startIndex+2,endIndex)
  let [id,type,title,pid] = summary.split('-').map((v)=>{
    return v.trim()
  })
  let content = this.code.slice(endIndex+2,block.length-6)
  content = content.split('\n').map((token)=>{
    return token.trim()
  }).join('\n')
  this.tokens.push({
    loc:{
      start:this.actualIindex,
      end:this.actualIindex+blockEndIndex
    },
    index:this.index,
    code:this.code.substring(0,blockEndIndex),
    willDestroyed:false,
    mark:{
      id,
      type,
      mode:this.code.match(/^\/\*####/g)?'js':'css',
      title,
      pid,
      content,
      children:[],
      parent:[]
    }

  })
  this.advance(blockEndIndex)
  this.index=this.index+1
  this.continue()
}

Parser.prototype.parseNormal = function(endIndex){
  this.tokens.push({
    loc:{
      start:this.actualIindex,
      end:this.actualIindex+endIndex
    },
    index:this.index,
    code:this.code.substring(0,endIndex)
  })
  this.index=this.index+1
}

function parse(code){
  let parser = new Parser(code)
  parser.run()
  return parser.tokens
}

function codegen(ast){
    let code = ''
    ast.map((node)=>{
      if(node.mark){
        if(!node.willDestroyed){
          let mark = node.mark
          code = code  + '\n' +  
                 (mark.mode==='js'?blockStart:HTMLBlockStart) + '\n' + 
                 titleStart + mark.id + '-' + mark.type + '-' + mark.title + titleEnd + '\n' + 
                 mark.content + '\n' + 
                 (mark.mode==='js'?blockEnd:HTMLBlockEnd) + '\n'
        }
      }else{
        code=code+node.code
      }
    })
    return code
}

function traverse(ast,callback){
  ast.map((node,index)=>{
    callback(node,index)
  })
}

module.exports = { parse, codegen, traverse};