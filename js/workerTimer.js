/*let startTime;
let intervalId;

self.onmessage = function(e) {
    console.log('Timer iniciado',e.data);
    if (e.data === 'start') {
        startTime = Date.now(); // Guarda el tiempo de inicio
        intervalId = setInterval(() => {
            const elapsedTime = Math.floor((Date.now() - startTime) / 1000); // Calcula el tiempo transcurrido en segundos
            self.postMessage(elapsedTime);
        }, 1000); // 1 segundo
    } else if (e.data === 'stop') {
        clearInterval(intervalId); // Detiene el intervalo
        const finalTime = Math.floor((Date.now() - startTime) / 1000);
        self.postMessage(finalTime); 
    }
};

*/

let startTime;
let intervalId;

self.addEventListener('message', (event) => {
    try{
        if (event.data === 'start') {
            console.log('Timer started'); // Log in worker console (if available)
            startTime = Date.now();
            intervalId = setInterval(() => {
                const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
                self.postMessage(elapsedTime);
            }, 1000);
         } 
         else if (event.data === 'stop') {
            clearInterval(intervalId);
            const finalTime = Math.floor((Date.now() - startTime) / 1000);
            self.postMessage(finalTime);
        }
    }
    catch{
        
    }
  });