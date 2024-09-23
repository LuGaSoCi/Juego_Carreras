let timer = 0;
let intervalId;

self.onmessage = function(e) {
    console.log('Message received in worker:', e.data); // Verificar el mensaje recibido
    if (e.data === 'start' && !intervalId) {
        timer = 0; // Reiniciar el temporizador
        intervalId = setInterval(() => {
            timer++;
            self.postMessage(timer);
        }, 1000);
    } else if (e.data === 'stop') {
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null; // Reinicia el intervalo
        }
        self.postMessage(timer); // Envía el tiempo final al finalizar
    }
};
