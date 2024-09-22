let timer = 0;
let intervalId;

self.onmessage = function(e) {
    if (e.data === 'start') {
        intervalId = setInterval(() => {
            timer++;
            self.postMessage(timer);
        }, 1000);
    } else if (e.data === 'stop') {
        clearInterval(intervalId);
        self.postMessage(timer);
    }
};
 