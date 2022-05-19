const path = require("path");
const fs = require("fs");
const process = require("process");
const { getAST, getLibbraryDependencies, transform } = require("./parse");

module.exports = class Compiler {
  constructor(options) {
    const { entry, output, template } = options;
    this.entry = entry;
    this.output = output;
    this.template = template;
    this.modules = [];
  }
  run() {
    const entryMap = this.buildModule(this.entry, true);
    this.modules.push(entryMap);
    entryMap.dependencies.forEach((dependency) => {
      this.modules.push(this.buildModule(dependency));
    });
    console.log(this.module);
    this.fileOutput();
    this.templateOutput();
  }
  buildModule(filename, entry) {
    let ast;
    if (entry) {
      ast = getAST(filename);
    } else {
      const depsPath = path.join(process.cwd(), "src", filename);
      console.log(depsPath);
      ast = getAST(depsPath);
    }
    console.log("what", ast);
    return {
      filename,
      dependencies: getLibbraryDependencies(ast),
      transformCode: transform(ast),
    };
  }
  fileOutput() {
    console.log(this.output);
    const outputFile = path.join(this.output.path, this.output.filename);
    let moduleOutput = "";
    this.modules.forEach((moduleItem) => {
      moduleOutput += `'${moduleItem.filename}': function(require, module, exports){ ${moduleItem.transformCode}},`;
    });
    const outputs = `(function(modules){
      var require = function(moduleName) {
        var module = {
          exports: {}
        }
        modules[moduleName](require, module, module.exports)
        return module.exports
      }
      require('${this.entry}')
    })({
      ${moduleOutput}
    })`;
    fs.writeFileSync(outputFile, outputs, "utf8");
  }
  templateOutput() {
    let templateCode = fs.readFileSync(this.template, "utf8");
    templateCode = templateCode.replace("<%URL%>", "./" + this.output.filename);
    fs.writeFileSync(
      path.join(this.output.path, "index.html"),
      templateCode,
      "utf8"
    );
  }
};
