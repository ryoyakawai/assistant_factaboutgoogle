(function() {
    if(document.location.protocol=="https:" || document.location.hostname=="localhost") {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('./sw.js').then( registration => {
                console.log('ServiceWorker: Registration Succeed. Scope: ', registration.scope);
            }).catch( err => {
                console.log('ServiceWorker: Registration Failed.  Message: ', err);
            });
        } else {
            console.warn('ServiceWorker disabled since your access is from HTTP. Use HTTPS to enable it.');
        }
    }
})();
