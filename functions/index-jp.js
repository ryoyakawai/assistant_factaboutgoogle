'use strict';

const functions = require('firebase-functions'); // Cloud Functions for Firebase library
const DialogflowApp = require('actions-on-google').DialogflowApp; // Google Assistant helper library

const googleAssistantRequest = 'google'; // Constant to identify Google Assistant requests


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
    
    let fact = 'Default Fact';
    let card = {src: null, alt: null};
    let factCategory = app.getArgument('fact-category');
    const actionHandlers = {
        'tell_fact': () => {
            switch(factCategory) {
            case '歴史':
                fact = 'グーグルは、インターネット関連のサービスと製品に特化したアメリカの多国籍テクノロジー企業である。検索エンジン、オンライン広告、クラウドコンピューティング、ソフトウェア、ハードウェア関連の事業がある。スタンフォード大学の博士課程に在籍していたラリー・ペイジとセルゲイ・ブリンによって創業された。'; 
                card ={src: 'http://162.243.3.155/wp-content/uploads/2016/03/wp-page_brin-COURTESY-GOOGLE.jpg',
                       alt: 'Larry Page & Sergey Brin'};
                
                break;
            case '本社':
                fact = 'グーグル本社はアメリカ合衆国カリフォルニア州マウンテンビューにあり、グーグルプレックスという愛称で親しまれている。愛称のグーグルプレックスは、10の10乗の更に100乗を意味するグーゴルプレックスに由来している。';
                card ={src: 'https://www.solarpowerauthority.com/wp-content/uploads/solar-panels-on-the-googleplex.jpg',
                       alt: 'Googleplex'};
                break;
            }
            let factSpeech = 'グーグルの' + factCategory + 'は2017年10月21日のja.wikipedia.orgの情報です。' + fact + '次はグーグルの歴史とグーグルの本社のどちらを聞きたいですか？終了する場合は終了と指示してください。';
            if(app.hasSurfaceCapability(app.SurfaceCapabilities.SCREEN_OUTPUT)
               && (card.src!==null && card.alt!==null) ) {
                app.ask(app.buildRichResponse()
                        .addSimpleResponse({speech: factSpeech, displayText: 'Google\'s ' + factCategory})
                        .addBasicCard(
                            app.buildBasicCard(fact)
                                .setImage(card.src, card.alt)
                        )
                       ).addSuggestions(['history', 'Headquarters']);
            } else {
                app.ask(factSpeech);
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
