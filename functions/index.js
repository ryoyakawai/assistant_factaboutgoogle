'use strict';

const functions = require('firebase-functions'); // Cloud Functions for Firebase library
const DialogflowApp = require('actions-on-google').DialogflowApp; // Google Assistant helper library

const googleAssistantRequest = 'google'; // Constant to identify Google Assistant requests

//const res = require('./response.js');

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
    //res.init(app);
    
    let fact = 'Default Fact';
    let card = {src: null, alt: null};
    let factCategory = app.getArgument('fact-category');
    
    const actionHandlers = {
        'tell_fact': () => {
            switch(factCategory) {
            case 'history':
            case 'past':
                fact = 'Google Inc. is an American multinational technology company that specializes in Internet-related services and products. These include online advertising technologies, search, cloud computing, software, and hardware. Google was founded in 1998 by Larry Page and Sergey Brin while they were Ph.D. students at Stanford University, in California.'; 
                card ={src: 'http://162.243.3.155/wp-content/uploads/2016/03/wp-page_brin-COURTESY-GOOGLE.jpg',
                       alt: 'Larry Page & Sergey Brin'};
                
                break;
            case 'headquarters':
            case 'HQ':
                fact = 'Google\'s headquarters in Mountain View, California, is referred to as the Googleplex, a play on words on the number googolplex and the headquarters itself being a complex of buildings. The lobby is decorated with a piano, lava lamps, old server clusters, and a projection of search queries on the wall.';
                card ={src: 'https://www.solarpowerauthority.com/wp-content/uploads/solar-panels-on-the-googleplex.jpg',
                       alt: 'Googleplex'};
                break;
            }
            let factSpeech = 'This is ' + factCategory + ' about Google based on infomation on www.wikipedia.org on October twentieth 2017.' + fact + 'What would you like to hear about next? Google\'s history or headquarters? Or to quit, say bye.';
            if(app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)
               && (card.src!=null && card.alt!=null) ) {
                app.ask(app.buildRichResponse()
                        .addSimpleResponse({speech: factSpeech, displayText: 'Google\'s ' + factCategory})
                        .addBasicCard(
                            app.buildBasicCard(fact)
                                .setImage(card.src, card.alt)
                        )
                       ).addSuggestions(['history', 'Headquarters']);
            } else {
                app.ask(factSpeech);
//                    res.sendGoogleResponse(factSpeech);
            }
        }
    };

    // If undefined or unknown action use the default handler
    if (!actionHandlers[action]) {
        action = 'default';
    }
    
    // Run the proper handler function to handle the request from Dialogflow
    actionHandlers[action]();
    
});
