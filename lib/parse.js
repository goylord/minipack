const fs = require('fs');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const { transformFromAst } = require('@babel/core')


module.exports = {
  getAST: (path) => {
    const sourceCode = fs.readFileSync(path, 'utf8');
    return parser.parse(sourceCode, {
      sourceType: 'module'
    })
  },
  getLibbraryDependencies: (ast) => {
    const dependencies = []
    traverse(ast, {
      ImportDeclaration: ({node}) => {
        console.log('the node', node)
        dependencies.push(node.source.value)
      }
    })
    return dependencies
  },
  transform: (ast) => {
    const { code } = transformFromAst(ast, null, {
      presets: ['env']
    })
    return code
  }
}