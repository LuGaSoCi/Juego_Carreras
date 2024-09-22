let laps = { jugador1: 0, jugador2: 0 };

self.onmessage = function(e) {
    const { player } = e.data;
    laps[player]++;
    self.postMessage({ player, laps: laps[player] });
};
 