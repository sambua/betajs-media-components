 const { BetaJS, container } = require('./index');

 const runner = (attrs) => {
    const player = new BetaJS.MediaComponents.VideoPlayer.Dynamics.Player({
        element: container,
        attrs: attrs || {}
    });
    player.activate();
    return player;
}

module.exports = runner;
