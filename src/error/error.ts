export enum ERR {
  BAD_ACCESS_TOKEN,
  NO_SOCIAL_IDENTITY
}

export class AuthyError {
  public err: ERR;
  public vars: any[];
  constructor(error: ERR, vars: any[]) {
    this.err = error;
    this.vars = vars;
  }
}

// a fast easy look up solution for errors which can dynamically create error responses
export const authyErrorDict = {
  [ERR.BAD_ACCESS_TOKEN] : (vars: any[]) => 'Failed to get access token from authentication flow',
  [ERR.NO_SOCIAL_IDENTITY] : (vars: any[]) => `Failed to get back an identity from auth0 management with the id: ${vars[0]}`
};
