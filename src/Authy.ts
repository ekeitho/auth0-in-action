import { Conversation } from 'actions-on-google';
import { AuthenticationClient, Identity, ManagementClient, User } from 'auth0';
import { AuthyError, ERR } from './error/error';
import { ActionsInterceptor, ErrorInterceptor, ThrowInterceptor } from './error/interceptor';

interface AuthyOptions<UserStorage> {
  applicationName: string;
  clientId: string;
  clientSecret: string;

  // debug feature,
  conversation?: Conversation<UserStorage>;
}

export class Authy<UserStorage> {

  // no typing for auth0 currently
  private readonly auth0Client: any;
  private readonly authyOptions: AuthyOptions<UserStorage>;
  private readonly errorInterceptor: ErrorInterceptor;

  constructor(authyOptions: AuthyOptions<UserStorage>) {
    this.authyOptions = authyOptions;

    this.auth0Client = new AuthenticationClient({
      clientId: this.authyOptions.clientId,
      clientSecret: this.authyOptions.clientSecret,
      domain: this.authyOptions.applicationName + '.auth0.com',
    });

    //
    this.errorInterceptor =
      !!this.authyOptions.conversation
        ? new ActionsInterceptor(this.authyOptions.conversation)
        : new ThrowInterceptor();
  }

  public async getSocialIdentity(token: string): Promise<SocialIdentity> {
    if (!token || token.length === 0) {
      throw new Error(this.errorInterceptor.intercept(new AuthyError(ERR.BAD_ACCESS_TOKEN, [])));
    }

    let userDetail: PublicIdentity;
    try {
      userDetail = await this.getPublicIdentity(token);
    } catch(err) {
      console.log(err);
      throw new Error(err);
    }

    const auth0ManagmentToken: string = await this.getAuth0ManagementToken();
    const secureIdentity: Identity = await this.getSecureIdentity(userDetail, auth0ManagmentToken);
    return {
      access_token: secureIdentity.access_token,
      username: userDetail.nickname,
    };
  }

  // from the user profile we attained from the auth client and the
  // access token generated to talk to our protected auth0 server
  // we can now securely grab the access_token from the social partner
  private async getSecureIdentity(userDetail: PublicIdentity, auth0ManagementToken: string): Promise<Identity> {
    const management = new ManagementClient({
      domain: this.authyOptions.applicationName + '.auth0.com',
      token: auth0ManagementToken,
    });

    const socialUser: User = await management.getUser({ id: userDetail.sub });

    if (!socialUser.identities) {
      throw new Error(this.errorInterceptor.intercept(new AuthyError(ERR.NO_SOCIAL_IDENTITY, [userDetail.sub])));
    }

    return socialUser.identities[0];
  }

  // when going through a successful authentication flow through google actions
  // we get back an access token, which verifies the user on our auth0 account
  // which is not the access token for the social media account!
  private async getPublicIdentity(token: string): Promise<PublicIdentity> {
    return this.auth0Client.getProfile(token);
  }

  // the users social auth token is on the protected server
  // but we need to get access to that server. so to talk to it later
  // we need an auth token to talk to it as well.
  private async getAuth0ManagementToken(): Promise<string> {
    const auth = await this.auth0Client.clientCredentialsGrant(
      {
        audience: `https://${this.authyOptions.applicationName}.auth0.com/api/v2/`,
        scope: 'read:users',
      },
    );
    return auth.access_token;
  }


}

export interface SocialIdentity {
  access_token: string | undefined;
  username: string | undefined;
}

export interface PublicIdentity {
  sub: string; // the auth0 user id, which can be used in the management client
  name: string;
  nickname: string | undefined;
  picture: string | undefined;
}