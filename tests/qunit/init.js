const { JSDOM } = require("jsdom");
const ResizeObserver = require('resize-observer-polyfill');

const dom = new JSDOM('<!DOCTYPE html>');
const { window } = dom;
const document = window.document;

global.window = window;
global.document = window.document;
global.ResizeObserver = ResizeObserver;

// If you require call with -noscoped
// const Scoped = require('../../node_modules/betajs-scoped/dist/scoped.js');
// window.Scoped = Scoped;

const BetaJS = require('../../node_modules/betajs/dist/beta.js');
const components = [
    '../../node_modules/betajs-shims/dist/betajs-shims.js',
    '../../node_modules/betajs-browser/dist/betajs-browser.js',
    '../../node_modules/betajs-media/dist/betajs-media.js',
    '../../node_modules/betajs-dynamics/dist/betajs-dynamics.js',
    '../../dist/betajs-media-components.js',
];

let container = document.createElement('div');
document.body.appendChild(container);
components.forEach((component) => {
    require(component);
});

const init = (attrs) => {
    const player = new BetaJS.MediaComponents.VideoPlayer.Dynamics.Player({
        element: container,
        attrs: attrs || {}
    });
    player.activate();
    return player;
}

module.exports = {
    BetaJS,
    initPlayer: init,
};
