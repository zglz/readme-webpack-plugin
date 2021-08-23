import marked from 'marked'
import hljs from 'highlight.js'
const crypto = require('crypto')

var rendererMD = new marked.Renderer()

marked.setOptions({
  renderer: rendererMD,
  gfm: true,
  tables: true,
  breaks: false,
  pedantic: false,
  sanitize: false,
  smartLists: true,
  smartypants: false
})

marked.setOptions({
  highlight: function(code) {
    return hljs.highlightAuto(code).value
  }
})

function genHashCode(code) {
  const hash = crypto.createHash('md5')
  hash.update(code)
  return hash.digest('hex')
}

export { marked, hljs, genHashCode }
