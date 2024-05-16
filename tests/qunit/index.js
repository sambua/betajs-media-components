const fs = require("fs");
const { BetaJS, container } = require('./init');

const QUnit = require("qunit");
const specsFolder = require("path").join(__dirname, "specs");

QUnit.module('Player');

const includeFiles = (dir, file) => {
    file = file || [];
    const inputs = fs.readdirSync(dir);
    for (var i in inputs) {
        var name = dir + '/' + inputs[i];
        if (fs.statSync(name).isDirectory()){
            includeFiles(name, file);
        } else {
            file.push(name);
            if (name.match(/\.spec.js$/) === null) {
                console.log(`Skipping ${name} as it's not ends with .spec.js`);
            } else {
              require(name);
            }
        }
    }
    return file;
}
console.log(`CI: `, process.env?.CI);
if (process.env?.CI) includeFiles(specsFolder);

QUnit.testDone((details) => {
  console.log(`Details: `, details);
});

QUnit.done((report) => {
  const { failed, passed, runtime, total } = report;
  process.env.QUNIT_TOTAL = total;
  process.env.QUNIT_FAILED = failed;
  process.env.QUNIT_PASSED = passed;
  process.env.QUNIT_RUNTIME = runtime;
  console.log(`After all test passed: `,report);
  process.exit(failed);
});

module.exports = {
  BetaJS, container, QUnit
}
