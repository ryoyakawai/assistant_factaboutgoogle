const messaging = firebase.messaging();

const tokenDivId = 'token_div';
const permissionDivId = 'permission_div';

// Play Sound
// https://github.com/g200kg/webaudio-tinysynth
const synth = new WebAudioTinySynth({quality:0, useReverb:0});
//const pw = new Playword(synth);
const pw = window.playword;
pw.init(synth);
const midi = document.querySelector('#midiout');
pw.setbpm(300);
pw.setMIDIOutdevice(midi);
function tinyPlay(word) {
    if(word!==null && word!='') {
        let obj = {};
        pw.sendProgramChange(1, 9);
        if(typeof word != 'undefined' && word !== null) obj = pw.play(word);
        for(let i=0; i<word.length; i++) {
            add(word.substr(i, 1));
        }
        setTimeout(() => {
            add(word, false);
        }, 1500);
    }
}

// Candlebulb
const defc = {r:255, g:169, b:24};
document.querySelector('#connectbulb').addEventListener('mousedown', (event) => {
    playbulbCandle.setDisconnectedEvent( () => {
        handleConnectionButton('show');
    });
    playbulbCandle.connect()
        .then( () => {
            console.log('[connected]', playbulbCandle.device);
            return playbulbCandle.getDeviceName()
                .then(handleDeviceName)
                .then( () => playbulbCandle.getBatteryLevel()
                       .then( level => {
                           handleBatteryLevel(level);
                           handleConnectionButton('delete');
                       }));
        }).catch( error => {
            console.error('[Connecting]', error);
        });
});
function handleDeviceName(deviceName) {
    console.log('[Device Name] ' , deviceName);
}
function handleBatteryLevel(batteryLevel) {
    console.log('[Battery Level] ', batteryLevel + '%');
}
function handleConnectionButton(type) {
    switch(type) {
    case 'delete':
        document.querySelector('#connectbulb').style.setProperty('display', 'none');
        playbulbCandle.setCandleEffectColor(defc.r, defc.g, defc.b);
        //playbulbCandle.setColor(defc.r, defc.g, defc.b);
        runCandlebulb = _runCandlebulb;
        break;
    case 'show':
        document.querySelector('#connectbulb').style.removeProperty('display');
        runCandlebulb =  function(){ };
        break;
    }
}
let timerId = null;
function runCandlebulb(word) {
    console.log('Candlebulb is not Connected');
};
async function _runCandlebulb(word) {
    for(let i=0; i<word.length; i++) {
        if(timerId !== null)  {
            clearTimeout(timerId);
            timerId = null;
        };
        
        let clr = getRandomRGB(); 
        playbulbCandle.setColor(clr.r, clr.g, clr.b);
        await sleep(200);
    };
    const time = 3000;//word.length() * 10;
    let clr = getRandomRGB(); 
    playbulbCandle.setFlashingColor(clr.r, clr.g, clr.b);
    timerId = setTimeout(() => {
        playbulbCandle.setCandleEffectColor(defc.r, defc.g, defc.b);
        //playbulbCandle.setColor(defc.r, defc.g, defc.b);
        timerId = null;
    }, time);

    function getRandomRGB() {
        let r = Math.random() * 255,
            g = Math.random() * 255,
            b = Math.random() * 255;
        return {r:r, g:g, b:b};
    }
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

};



// [START refresh_token]
// Callback fired if Instance ID token is updated.
messaging.onTokenRefresh(function() {
    messaging.getToken()
        .then(function(refreshedToken) {
            console.log('Token refreshed.');
            setTokenSentToServer(false);
            sendTokenToServer(refreshedToken);
            resetUI();
        })
        .catch(function(err) {
            console.log('Unable to retrieve refreshed token ', err);
            showToken('Unable to retrieve refreshed token ', err);
        });
});
// [END refresh_token]

// [START receive_message]
// Handle incoming messages. Called when:
// - a message is received while the app has focus
// - the user clicks on an app notification created by a sevice worker
//   `messaging.setBackgroundMessageHandler` handler.
messaging.onMessage(function(payload) {
    console.log("Message received. ", payload);
    //appendMessage(payload);
    
    let word = getParameterByName('play', payload.notification.click_action);
    tinyPlay(word);
    runCandlebulb(word);
    console.log("[Play Sound] ", word);
});
// [END receive_message]

function resetUI() {
    clearMessages();
    showToken('loading...');

    let word = getParameterByName('play');
    tinyPlay(word);
    runCandlebulb(word);
    
    // [START get_token]
    // Get Instance ID token. Initially this makes a network call, once retrieved
    // subsequent calls to getToken will return from cache.
    messaging.getToken()
        .then(function(currentToken) {
            if (currentToken) {
                sendTokenToServer(currentToken);
                updateUIForPushEnabled(currentToken);
            } else {
                // Show permission request.
                console.log('No Instance ID token available. Request permission to generate one.');
                // Show permission UI.
                updateUIForPushPermissionRequired();
                setTokenSentToServer(false);
            }
        })
        .catch(function(err) {
            document.querySelector('#messages').innerText="[ERROR:retriving token] Check 'Notification Permission'.";
            console.log('An error occurred while retrieving token. ', err);
            showToken('Error retrieving Instance ID token. ', err);
            setTokenSentToServer(false);
        });
}
// [END get_token]

function showToken(message) {
    console.log('[Token Status] ' + message);
}

// Send the Instance ID token your application server, so that it can:
// - send messages back to this app
// - subscribe/unsubscribe the token from topics
function sendTokenToServer(currentToken) {
    if (!isTokenSentToServer()) {
        console.log('Sending token to server...');
        
        insertTokenToFirebase(currentToken);
        setTokenSentToServer(true);
    } else {
        console.log('Token already sent to server so won\'t send it again ' +
                    'unless it changes');
    }

}

function isTokenSentToServer() {
    return window.localStorage.getItem('sentToServer') == 1;
}

function setTokenSentToServer(sent) {
    window.localStorage.setItem('sentToServer', sent ? 1 : 0);
}

function insertTokenToFirebase(currentToken) {
    firebase.database().ref('/fcmTokens').child(currentToken)
        .set(firebase.auth().currentUser.uid);
}

function showHideDiv(divId, show) {
    const div = document.querySelector('#' + divId);
    if (show) {
        div.style = "display: visible";
    } else {
        div.style = "display: none";
    }
}

document.querySelector('#requestpermission').addEventListener('mousedown', requestPermission);

function requestPermission() {
    console.log('Requesting permission...');
    // [START request_permission]
    messaging.requestPermission()
        .then(function() {
            console.log('Notification permission granted.');
            resetUI();
        })
        .catch(function(err) {
            console.log('Unable to get permission to notify.', err);
        });
    // [END request_permission]
}

document.querySelector('#updatetoken').addEventListener('mousedown', deleteToken);
function deleteToken() {
    console.log('start updating token');
    messaging.getToken()
        .then(function(currentToken) {
            messaging.deleteToken(currentToken)
                .then(function() {
                    console.log('Token deleted.');
                    setTokenSentToServer(false);
                    resetUI();
                })
                .catch(function(err) {
                    console.log('Unable to delete token. ', err);
                });
        })
        .catch(function(err) {
            console.log('Error retrieving Instance ID token. ', err);
            showToken('Error retrieving Instance ID token. ', err);
        });
    
}

// Add a message to the messages element.
function appendMessage(payload) {
    const messagesElement = document.querySelector('#messages');
    const dataHeaderELement = document.createElement('h5');
    const dataElement = document.createElement('pre');
    dataElement.style = 'overflow-x:hidden;';
    dataHeaderELement.textContent = 'Received message:';
    dataElement.textContent = JSON.stringify(payload, null, 2);
    messagesElement.appendChild(dataHeaderELement);
    messagesElement.appendChild(dataElement);
}

// Clear the messages element of all children.
function clearMessages() {
    /*
     const messagesElement = document.querySelector('#messages');
     while (messagesElement.hasChildNodes()) {
     messagesElement.removeChild(messagesElement.lastChild);
     }
     */
}

function updateUIForPushEnabled(currentToken) {
    showHideDiv(tokenDivId, true);
    showHideDiv(permissionDivId, false);
    //showToken(currentToken);
}

function updateUIForPushPermissionRequired() {
    showHideDiv(tokenDivId, false);
    showHideDiv(permissionDivId, true);
}

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

firebase.auth().onAuthStateChanged( (user) => {
    let signedin = document.querySelector('#signedin');
    let signedout = document.querySelector('#signedout');
    let uiConfig = {
        signInSuccessUrl: './',
        signInOptions: [
            firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        ],
        // Terms of service url.
        tosUrl: ''
    };

    if(user) {
        console.log(user);
        signedin.style.removeProperty('display');
        //requestPermission();
        console.log(firebase.auth().currentUser.uid);
        resetUI();
    } else {
        signedout.style.removeProperty('display');
        let ui = new firebaseui.auth.AuthUI(firebase.auth());
        ui.start('#firebaseui-auth-container', uiConfig);
    }

} );

