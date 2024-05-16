 const { BetaJS, container } = require('./init');

 const runner = (attrs) => {
    const player = new BetaJS.MediaComponents.VideoPlayer.Dynamics.Player({
        element: container,
        attrs: attrs || {}
    });
    player.activate();
    return player;
}

module.exports = runner;
