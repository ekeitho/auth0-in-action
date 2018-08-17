import { Conversation } from 'actions-on-google';
import { AuthyError, authyErrorDict } from './error';

export interface ErrorInterceptor {
  intercept(error: AuthyError): string;
}

export class ThrowInterceptor implements ErrorInterceptor {
  public intercept(error: AuthyError): string {
    return authyErrorDict[error.err](error.vars);
  }
}

/*
  why have this?
    1. its a debug feature.
    2. i found that having to look back at my logs was a tedious task when developing gactions
       therefore i wanted something that would return me the message in my conversation as a debug option
       but also be neat about how it returns those messages

       1. neat? each step through the way i found things i did wrong with auth0 and i want to catch those errors
                and return a helpful list of suggestions on how to solve the problem for developers to build
                what they want faster vs having to look up all the things at StackOverflow, etc...
 */
export class ActionsInterceptor<UserStorage> extends ThrowInterceptor {
  private conversation: Conversation<UserStorage>;
  constructor(conversation: Conversation<UserStorage>){
    super();
    this.conversation = conversation;
  }
  public intercept(error: AuthyError): string {
    const errString = super.intercept(error);
    this.conversation.ask(errString);
    return errString;
  }
}