const Alexa = require('ask-sdk-core');
const moment = require('moment-timezone');

const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'LaunchRequest';
    },
    handle(handlerInput) {
        const speakOutput = 'Welcome to the Mont-Ah Vista Bell Schedule skill! Ask me about the next period, what time a specific period is, or when lunch is.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
const periodInformation = {
    1: {
        start: "8:00 AM",
        end: "9:30 AM",
        days: "MTh"
    },
    2: {
        start: "9:45 AM",
        end: "11:15 AM",
        days: "MTh"
    },
    3: {
        start: "12:15 PM",
        end: "1:45 PM",
        days: "MTh"
    },
    4: {
        start: "9:00 AM",
        end: "10:30 AM",
        days: "TuF"
    },
    5: {
        start: "10:45 AM",
        end: "12:15 PM",
        days:"TuF"
    },
    6: {
        start: "2:00 PM",
        end: "3:30 PM",
        days: "TuF"
    },
    7: {
        start: "2:00 PM",
        end: "3:30 PM",
        days: "MTh"
    }
};
const periodDaysConverter = {
    "MTh":"Monday and Thursday",
    "TuF": "Tuesday and Friday"
}   ;

const ordinals = ["first", "second", "third", "fourth", "fifth", "sixth", "seventh"];

const AskAboutPeriodIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AskAboutPeriodIntent';
    },
    handle(handlerInput) {
        console.log("LOGLOGLOGLOG" + JSON.stringify(handlerInput));

        const period = parseInt(handlerInput.requestEnvelope.request.intent.slots.period.value, 10);



        const info = periodInformation[period];
        const speakOutput = `${ordinals[period - 1]} period is every ${periodDaysConverter[info.days]}, from ${info.start} to ${info.end}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
const DAY_OF_WEEK = {
    "MONDAY":1,
    "TUESDAY":2,
    "WEDNESDAY":3,
    "THURSDAY":4,
    "FRIDAY":5,
    "SATURDAY":6,
    "SUNDAY":0
};
const WhenIsLunchIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'WhenIsLunchIntent';
    },
    handle(handlerInput) {
        let speakOutput = "";
        const timestamp = new moment(handlerInput.requestEnvelope.request.timestamp).tz('America/Los_Angeles');

        if (timestamp.day() === DAY_OF_WEEK.MONDAY || timestamp.day() === DAY_OF_WEEK.THURSDAY) {
            speakOutput = `Lunch ${(timestamp.hour() <= 11 || (timestamp.hour() === 12 && timestamp.minute() < 15)) ? "is" : "was"} from 11:15 AM to 12:15 PM today.`;
        } else if (timestamp.day() === DAY_OF_WEEK.TUESDAY || timestamp.day() === DAY_OF_WEEK.FRIDAY) {
            speakOutput = `Lunch ${(timestamp.hour() <= 12 || (timestamp.hour() === 12 + 1 && timestamp.minute() < 15)) ? "is" : "was"} from 12:15 PM to 1:15 PM today.`;
        } else if (timestamp.day() === DAY_OF_WEEK.WEDNESDAY) {
            speakOutput = `Lunch ${timestamp.hour() <= 1 ? "is" : "was"} from 12:00 PM to 1:00 PM today.`;
        } else {
            speakOutput = "There's no school today. Lunch is whenever you want.";
        }

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
const NextPeriodIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'NextPeriodIntent';
    },
    handle(handlerInput) {
        console.log("hi" + JSON.stringify(handlerInput));
        const timestamp = new moment(handlerInput.requestEnvelope.request.timestamp).tz('America/Los_Angeles');
        let nextPeriod = -1;
        let periodsExistToday = true;
        if (timestamp.day() === DAY_OF_WEEK.MONDAY || timestamp.day() === DAY_OF_WEEK.THURSDAY) {
            if (timestamp.hour() < 8) {
                nextPeriod = 1;
            } else if (timestamp.hour() <= 9 || (timestamp.hour() === 10 && timestamp.minute() < 45)) {
                nextPeriod = 2;
            } else if (timestamp.hour() <= 11 || (timestamp.hour() === 12 && timestamp.minute() < 15)) {
                nextPeriod = 3;
            } else if (timestamp.hour() <= 12 + 2) {
                nextPeriod = 7;
            }
        } else if (timestamp.day() === DAY_OF_WEEK.TUESDAY || timestamp.day() === DAY_OF_WEEK.FRIDAY) {
            if (timestamp.hour() <= 9) {
                nextPeriod = 4;
            } else if (timestamp.hour() <= 10 || (timestamp.hour() === 11 && timestamp.minute() < 45)) {
                nextPeriod = 5;
            } if (timestamp.hour() <= 12 + 2) {
                nextPeriod = 6;
            }
        } else {
            periodsExistToday = false;
        }
        let speakOutput = "";
        if (nextPeriod !== -1) {
            const info = periodInformation[nextPeriod];
            speakOutput = `The next class today is ${ordinals[nextPeriod - 1]} period, from ${info.start} to ${info.end}`;
        } else {
            speakOutput = `There aren't any ${periodsExistToday ? "more " : ""}periods today.`;
        }

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};

const HelpIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'I can tell you when the next period is, or you can ask about a specific period. I can also tell you when lunch is.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

const CancelAndStopIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && (Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.CancelIntent'
                || Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.StopIntent');
    },
    handle(handlerInput) {
        const speakOutput = 'Goodbye!';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .getResponse();
    }
};
/* *
 * FallbackIntent triggers when a customer says something that doesn’t map to any intents in your skill
 * It must also be defined in the language model (if the locale supports it)
 * This handler can be safely added but will be ingnored in locales that do not support it yet
 * */
const FallbackIntentHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest'
            && Alexa.getIntentName(handlerInput.requestEnvelope) === 'AMAZON.FallbackIntent';
    },
    handle(handlerInput) {
        const speakOutput = 'Sorry, I don\'t know about that. Please try again.';

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};
/* *
 * SessionEndedRequest notifies that a session was ended. This handler will be triggered when a currently open
 * session is closed for one of the following reasons: 1) The user says "exit" or "quit". 2) The user does not
 * respond or says something that does not match an intent defined in your voice model. 3) An error occurs
 * */
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`~~~~ Session ended: ${JSON.stringify(handlerInput.requestEnvelope)}`);
        // Any cleanup logic goes here.
        return handlerInput.responseBuilder.getResponse(); // notice we send an empty response
    }
};
/* *
 * The intent reflector is used for interaction model testing and debugging.
 * It will simply repeat the intent the user said. You can create custom handlers for your intents
 * by defining them above, then also adding them to the request handler chain below
 * */
const IntentReflectorHandler = {
    canHandle(handlerInput) {
        return Alexa.getRequestType(handlerInput.requestEnvelope) === 'IntentRequest';
    },
    handle(handlerInput) {
        const intentName = Alexa.getIntentName(handlerInput.requestEnvelope);
        const speakOutput = `You just triggered ${intentName}`;

        return handlerInput.responseBuilder
            .speak(speakOutput)
            //.reprompt('add a reprompt if you want to keep the session open for the user to respond')
            .getResponse();
    }
};
/**
 * Generic error handling to capture any syntax or routing errors. If you receive an error
 * stating the request handler chain is not found, you have not implemented a handler for
 * the intent being invoked or included it in the skill builder below
 * */
const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const speakOutput = 'Sorry, I had trouble doing what you asked. Please try again.';
        console.log(`~~~~ Error handled: ${JSON.stringify(error)}`);

        return handlerInput.responseBuilder
            .speak(speakOutput)
            .reprompt(speakOutput)
            .getResponse();
    }
};

/**
 * This handler acts as the entry point for your skill, routing all request and response
 * payloads to the handlers above. Make sure any new handlers or interceptors you've
 * defined are included below. The order matters - they're processed top to bottom
 * */
exports.handler = Alexa.SkillBuilders.custom()
    .addRequestHandlers(
        LaunchRequestHandler,
        AskAboutPeriodIntentHandler,
        WhenIsLunchIntentHandler,
        NextPeriodIntentHandler,
        HelpIntentHandler,
        CancelAndStopIntentHandler,
        FallbackIntentHandler,
        SessionEndedRequestHandler,
        IntentReflectorHandler)
    .addErrorHandlers(
        ErrorHandler)
    .withCustomUserAgent('sample/hello-world/v1.2')
    .lambda();