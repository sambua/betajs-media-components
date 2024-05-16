 const runner = (attrs) => {
    const player = new BetaJS.MediaComponents.VideoPlayer.Dynamics.Player({
        element: require('./init').container,
        attrs: attrs || {}
    });
    player.activate();
    return player;
}

module.exports = runner;
