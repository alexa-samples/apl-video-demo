const Alexa = require('ask-sdk-core')
const videoURL = "https://public-us-east-1.s3.amazonaws.com/video/BigBuckBunny.mp4"

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'LaunchRequest'
  },
  handle(handlerInput) {
    const speechText = 'Welcome to the APL Video Demo! Here is your video.'
    return handlerInput.responseBuilder
      .speak(speechText)
      .addDirective({
        type: 'Alexa.Presentation.APL.RenderDocument',
        token: "documentToken",
        document: require('./apl/video'), 
        datasources: {
                    "data":
                    {
                        "properties":
                        {
                            "videoURL": videoURL
                        }
                    } 
                }
      })
      .addDirective({
              "type": "Alexa.Presentation.APL.ExecuteCommands",
              "token": "documentToken",
              "commands": [
                {  
                              "type": "ControlMedia",
                              "componentId": "videoPlayerId",
                              "command": "play"
                          }
    ]
})
      .getResponse()
  },
};

const VideoControlIntentHandler = {
  canHandle(handlerInput) {
      return handlerInput.requestEnvelope.request.type === 'IntentRequest'
          && handlerInput.requestEnvelope.request.intent.name === 'VideoControlIntent';
  },
  handle(handlerInput) {
      /* 
        This intent handler handles both play and pause for a video. It identifies what to through the video_action slot value which can either be play or pause.
        The slot value is utilized in the ControlMedia command dynamically.
      */
      const videoAction = handlerInput.requestEnvelope.request.intent.slots.video_action.value.toLowerCase();
      return handlerInput.responseBuilder
          // For more information about ControlMedia command see: https://developer.amazon.com/docs/alexa-presentation-language/apl-commands-media.html
          .addDirective({
              type : 'Alexa.Presentation.APL.ExecuteCommands',
              token: 'documentToken',
              commands: [
                  {
                      "type": "Sequential",
                      "commands": [
                          {  
                              "type": "ControlMedia",
                              "componentId": "videoPlayerId",
                              "command": `${videoAction}`
                          }
                      ]
                  }              
              ]
          })
          .getResponse();
  }
};

const HelpIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent'
  },
  handle(handlerInput) {
    const speechText = 'Press the button.'

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .withSimpleCard('Press the button and checkout GitHub for the source code.', speechText)
      .getResponse()
  },
};

const CancelAndStopIntentHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'IntentRequest'
      && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent'
        || handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent')
  },
  handle(handlerInput) {
    const speechText = 'Goodbye!'

    return handlerInput.responseBuilder
      .speak(speechText)
      .withSimpleCard('Thanks for trying the demo. You could find the code on GitHub', speechText)
      .getResponse()
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest'
  },
  handle(handlerInput) {
    console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`)

    return handlerInput.responseBuilder.getResponse()
  },
};

const ErrorHandler = {
  canHandle() {
    return true
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`)
    const speechText = 'I had trouble processing that request. Please try again and if the issue persists, please contact the skill developer. What can I help you with?'
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse()
  },
};

const skillBuilder = Alexa.SkillBuilders.custom()

exports.handler = skillBuilder
  .addRequestHandlers(
    LaunchRequestHandler,
    VideoControlIntentHandler,
    HelpIntentHandler,
    CancelAndStopIntentHandler,
    SessionEndedRequestHandler
  )
  .addErrorHandlers(ErrorHandler)
  .lambda();
