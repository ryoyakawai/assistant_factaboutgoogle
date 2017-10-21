// NOT IN USE
const response = function () {};

response.prototype = {
    // Function to send correctly formatted Google Assistant responses to Dialogflow which are then sent to the user
    init: function(app, response) {
        this.app = app;
    },
    sendGoogleResponse: function (responseToUser) {
        if (typeof responseToUser === 'string') {
            this.app.ask(responseToUser); // Google Assistant response
        } else {
            // If speech or displayText is defined use it to respond
            let googleResponse = this.app.buildRichResponse().addSimpleResponse({
                speech: responseToUser.speech || responseToUser.displayText,
                displayText: responseToUser.displayText || responseToUser.speech
            });
            
            // Optional: Overwrite previous response with rich response
            if (responseToUser.googleRichResponse) {
                googleResponse = responseToUser.googleRichResponse;
            }
            
            // Optional: add contexts (https://dialogflow.com/docs/contexts)
            if (responseToUser.googleOutputContexts) {
                this.app.setContext(...responseToUser.googleOutputContexts);
            }
            
            this.app.ask(googleResponse); // Send response to Dialogflow and Google Assistant
        }
    },
    
    // Function to send correctly formatted responses to Dialogflow which are then sent to the user
    sendResponse: function (responseToUser) {
        // if the response is a string send it as a response to the user
        if (typeof responseToUser === 'string') {
            let responseJson = {};
            responseJson.speech = responseToUser; // spoken response
            responseJson.displayText = responseToUser; // displayed response
            response.json(responseJson); // Send response to Dialogflow
        } else {
            // If the response to the user includes rich responses or contexts send them to Dialogflow
            let responseJson = {};
            
            // If speech or displayText is defined, use it to respond (if one isn't defined use the other's value)
            responseJson.speech = responseToUser.speech || responseToUser.displayText;
            responseJson.displayText = responseToUser.displayText || responseToUser.speech;
            
            // Optional: add rich messages for integrations (https://dialogflow.com/docs/rich-messages)
            responseJson.data = responseToUser.richResponses;
            
            // Optional: add contexts (https://dialogflow.com/docs/contexts)
            responseJson.contextOut = responseToUser.outputContexts;
            
            response.json(responseJson); // Send response to Dialogflow
        }
    }
};

module.exports = new response();
