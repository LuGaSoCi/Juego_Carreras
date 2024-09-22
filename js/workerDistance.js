let distances = { jugador1: 0, jugador2: 0 };

self.onmessage = function(e) {
    const { player, distance } = e.data;
    distances[player] += distance;
    self.postMessage({ player, distance: distances[player] });
};
 