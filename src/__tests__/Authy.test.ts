jest.mock('auth0', () => {
  return {
    AuthenticationClient: function() {
      return {
        getProfile(token: string) {
          return {
            name: 'keith',
            nickname: 'ekeitho',
            picture: 'img',
            sub: '987654321',
          };
        },
        clientCredentialsGrant(options: any) {
          return 'access_token'
        },
      };
    },
    ManagementClient: function() {
      return {
        getUser(userId: string) {
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

const authy = new Authy('appName',
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
    let error;

    try {
      await authy.getSocialIdentity(undefined);
    } catch (e) {
      error = e;
    } finally {
      expect(error).toBeDefined();
    }

  });
});

