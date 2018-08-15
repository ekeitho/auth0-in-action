jest.mock('auth0', () => {
  return {
    AuthenticationClient: function() {
      return {
        getProfile: function(token: string) {
          return {
            sub: '987654321',
            nickname: 'ekeitho',
            name: 'keith',
            picture: 'img',
          };
        },
        clientCredentialsGrant: function(options: any) {
          return 'access_token'
        },
      };
    },
    ManagementClient: function() {
      return {
        getUser: function(userId: string) {
          return {
            identities: [
              {
                access_token: 'aldbjf908dfl',
                username: '',
              },
            ],
          };
        },
      };
    },
  };
});

import { Authy } from '../Authy';

let authy = new Authy('appName',
  '093jlaksjdf',
  '0293r;alkjsdf');


describe('Authy Tests', () => {
  test('Test Facade', async () => {
    const id = await authy.getSocialIdentity('token');

    expect(id).toEqual({
      access_token: 'aldbjf908dfl',
      username: 'ekeitho'
    });

  });

  test('Test Bad User Input - Undefined Access Token', async () => {
    let error = undefined;

    try {
      // @ts-ignore - complains putting undefined as string
      await authy.getSocialIdentity(error);
    } catch (e) {
      error = e;
    } finally {
      expect(error).toBeDefined();
    }

  });
});

