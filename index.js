const Compiler = require('./lib/complie')

const options = require('./pack.config')
const complier = new Compiler(options)
complier.run()