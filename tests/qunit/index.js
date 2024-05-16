const fs = require("fs");
const path = require("path");
const QUnit = require("qunit");
const { JSDOM } = require("jsdom-latest");

const ResizeObserver = require('resize-observer-polyfill');

const specsFolder = path.join(__dirname, "specs");

const dom = new JSDOM('<!DOCTYPE html>');
const { window } = dom;
const document = window.document;

const isRealBrowser = Object.getOwnPropertyDescriptor(globalThis, 'window')?.get?.toString().includes('[native code]') ?? false

global.window = window;
global.document = window.document;

if (!isRealBrowser) {
  global.ResizeObserver = ResizeObserver;
  global.navigator = {
    ...(window.navigator || {}),
    // this is deprecated but still used in the code
    appCodeName: 'Mozilla',
    appName: 'Netscape',
    appVersion: 'mac-17.0',
    cookieEnabled: 'false',
    onLine: 'true',
    platform: 'MacIntel',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:17.0) Gecko/20100101 Firefox/17.0',
    window_chrome: 'false',
    window_opera: 'false',
    language: "en",
    isTouchable: 'false'
  }
  // global.window.navigator = global.navigator;

  // Below is the polyfill for HTMLMediaElement, as it's not available in JSDOM
  // this will prevent console the error when running the tests.
  // But should be careful when using this polyfill, as it's not the real implementation
  // and may cause the test to pass even if the real implementation is not working.
  // We have pass these test on real browser via playwright to make sure it's working correctly
  // if these are really needed we can implement: https://github.com/jsdom/jsdom/issues/2155#issuecomment-581862425
  window.HTMLMediaElement.prototype.load = () => { /* do nothing */ };
  window.HTMLMediaElement.prototype.play = () => { /* do nothing */ };
  window.HTMLMediaElement.prototype.pause = () => { /* do nothing */ };
  window.HTMLMediaElement.prototype.addTextTrack = () => { /* do nothing */ };
}

// If you require call with -noscoped
const Scoped = require('../../node_modules/betajs-scoped/dist/scoped.js');
window.Scoped = Scoped;

const BetaJS = require('../../node_modules/betajs/dist/beta-noscoped.js');
const components = [
    '../../node_modules/betajs-shims/dist/betajs-shims.js',
    '../../node_modules/betajs-browser/dist/betajs-browser-noscoped.js',
    '../../node_modules/betajs-media/dist/betajs-media-noscoped.js',
    '../../node_modules/betajs-dynamics/dist/betajs-dynamics-noscoped.js',
    '../../dist/betajs-media-components-noscoped.js',
];

components.forEach((component) => {
    require(component);
});

window.BetaJS = BetaJS;
global.BetaJS = BetaJS;

let container = document.createElement('div');
document.body.appendChild(container);

const initPlayer = (attrs) => {
   const player = new BetaJS.MediaComponents.VideoPlayer.Dynamics.Player({
       element: container,
       attrs: attrs || {}
   });
   player.activate();
   return player;
}


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
  QUnit,
  BetaJS,
  initPlayer: initPlayer
}
