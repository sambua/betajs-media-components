const fs = require("fs");
const QUnit = require("qunit");
const specsFolder = require("path").join(__dirname, "specs");

QUnit.module('Player');

fs.readdirSync(specsFolder).forEach(file => {
    if (file.match(/\.spec.js$/) === null) {
        console.log(`Skipping ${file} as it's not ends with .spec.js`);
    } else {
      require(specsFolder + '/' + file);
    }
});

QUnit.done((report) => {
  const { failed, passed, runtime, total } = report;
  // process.env.QUNIT_TOTAL = total;
  // process.env.QUNIT_FAILED = failed;
  // process.env.QUNIT_PASSED = passed;
  console.log(`After all test passed: `,report);
  process.exit(failed);
});

// Trouble on Github Actions implementation
// QUnit.autostart = false;
// let promises = []
// fs.readdir(specsFolder, (err, files) => {
//     files.forEach(file => {
//         promises.push(new Promise((resolve, reject) => {
//             if (file.match(/\.spec.js$/) === null) {
//                 console.log(`Skipping ${file} as it's not ends with .spec.js`);
//             } else {
//                 require(specsFolder + '/' + file);
//             }
//             resolve(true);
//         }))
//     })
// });

// Promise.all(promises)
//     .then(() => {
//         QUnit.start();

//         QUnit.test("last test", function(assert) {
//             assert.ok(true, "Passed!");
//         });

//         QUnit.testDone( function( details ) {
//             console.log("Finished running: ", details.name,
//                 `; \nFailed: ${details.failed} / Total: ${details.total}`
//             );
//             console.log(`export failed=${details.failed};`);
//             // if (details.failed > 0) {
//             //     QUnit.config.queue.length = 0;
//             //     process.exit(1, `Test failed on: ${details.module} - ${details.name}`);
//             // }
//             // if (details.name === "last test") {
//             //     QUnit.config.queue.length = 0;
//             //     process.exit(0);
//             // }
//         });
//     })
//     .catch(err => console.log(`error: ${err}`));
