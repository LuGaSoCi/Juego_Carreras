let timer = 0;
let intervalId;

self.onmessage = function(e) {
    if (e.data === 'start' && !intervalId) {
        intervalId = setInterval(() => {
            timer++;
            self.postMessage(timer);
        }, 1000);
    } else if (e.data === 'stop') {
        if (intervalId) {
            clearInterval(intervalId);
            // Para reiniciar el intervalo
            intervalId = null; 
        }
        self.postMessage(timer);
    }
};

 