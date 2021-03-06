import { AuthenticationClient, Identity, ManagementClient, User } from 'auth0';

export class Authy {

  private readonly domainName: string;
  private readonly clientId: string;
  private readonly clientSecret: string;

  // no typing for auth0 currently
  private readonly auth0Client: any;


  constructor(
    tenantDomainName: string,
    clientId: string,
    clientSecret: string) {

    this.domainName = tenantDomainName;
    this.clientId = clientId;
    this.clientSecret = clientSecret;

    this.auth0Client = new AuthenticationClient({
      clientId: this.clientId,
      clientSecret: this.clientSecret,
      domain: this.domainName + '.auth0.com',
    });

  }

  public async getSocialIdentity(token: string): Promise<SocialIdentity> {
    if (!token || token.length === 0) {
      throw new Error('Failed to get access token from authentication flow');
    }

    const userDetail: PublicIdentity = await this.getPublicIdentity(token);
    const auth0ManagmentToken: string = await this.getAuth0ManagementToken();
    const secureIdentity: Identity = await this.getSecureIdentity(userDetail, auth0ManagmentToken);
    return {
      oauth_token: secureIdentity.access_token,
      username: userDetail.nickname,
    };
  }

  // from the user profile we attained from the auth client and the
  // access token generated to talk to our protected auth0 server
  // we can now securely grab the oauth token from the social partner
  private async getSecureIdentity(userDetail: PublicIdentity, auth0ManagementToken: string): Promise<Identity> {
    const management = new ManagementClient({
      domain: this.domainName + '.auth0.com',
      token: auth0ManagementToken,
    });

    const socialUser: User = await management.getUser({ id: userDetail.sub });

    if (!socialUser.identities) {
      throw new Error(`Failed to get back an identity from auth0 management with the id: ${userDetail.sub}`);
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
        audience: `https://${this.domainName}.auth0.com/api/v2/`,
        scope: 'read:users',
      },
    );
    return auth.access_token;
  }

}

export interface SocialIdentity {
  oauth_token: string | undefined;
  username: string | undefined;
}

export interface PublicIdentity {
  sub: string; // the auth0 user id, which can be used in the management client
  name: string;
  nickname: string | undefined;
  picture: string | undefined;
}