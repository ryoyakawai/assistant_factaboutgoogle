/**
 * Copyright 2017 Ryoya Kawai
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
**/
'use strict';
console.log('[Deploy Done]');
const functions = require('firebase-functions'); // Cloud Functions for Firebase library
const DialogflowApp = require('actions-on-google').DialogflowApp; // Google Assistant helper library

const googleAssistantRequest = 'google'; // Constant to identify Google Assistant requests

const sendMessage = require('./sendmessage.js');
sendMessage.init();


exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
    console.log('Request headers: ' + JSON.stringify(request.headers));
    console.log('Request body: ' + JSON.stringify(request.body));
    
    // An action is a string used to identify what needs to be done in fulfillment
    let action = request.body.result.action; // https://dialogflow.com/docs/actions-and-parameters
    
    // Parameters are any entites that Dialogflow has extracted from the request.
    const parameters = request.body.result.parameters; // https://dialogflow.com/docs/actions-and-parameters
    
    // Contexts are objects used to track and store conversation state
    const inputContexts = request.body.result.contexts; // https://dialogflow.com/docs/contexts
    
    // Get the request source (Google Assistant, Slack, API, etc) and initialize DialogflowApp
    const requestSource = (request.body.originalRequest) ? request.body.originalRequest.source : undefined;
    const app = new DialogflowApp({request: request, response: response});
    
    let moment = require('moment');
    let fact = 'Default Fact';
    let card = {src: null, alt: null};
    let cateName = app.getArgument('fact-category');
    
    console.log('[Category] ', cateName);
    const actionHandlers = {
        'input.unknown': () => {
            let body = '['+getTimeStamp()+'] This message send by hooked by fulfillment of Dialogflow through the Firebase Cloud Messaging.';
            sendMessage.setPayload(
                'Sound Maker',
                body,
                null,
                'https://actionswithfcm-7362c.firebaseapp.com?play=' + app.getRawInput()
            );
            sendMessage.sendNotifications();
        },
/*
        'tell_fact': () => {
            switch(cateName) {
            case 'history':
            case 'past':
                fact = 'Good to hear that. Do you want to hear another one?'; 
                break;
            case 'headquarters':
            case 'headquarter':
                fact = 'Sorry about that. May I have another shot?';
                break;
            }
            let factSpeech = fact + ',or to finish, say Bye.';
            app.ask(factSpeech);
        }
*/
    };

    // If undefined or unknown action use the default handler
    if (!actionHandlers[action]) {
        action = 'default';
    }
    
    // Run the proper handler function to handle the request from Dialogflow
    actionHandlers[action]();

    function getTimeStamp() {
        return moment().format();
    }
});
