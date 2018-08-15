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
          return 'access_token';
        },
      };
    },
    ManagementClient: function() {
      return {
        getUser() {
          return {
            identities: [{ access_token: 'aldbjf908dfl', username: '' }],
          };
        },
      };
    },
  };
});


import { Authy } from '../Authy';

let authy: Authy;

beforeEach(() => {
  authy = new Authy('appName',
    '093jlaksjdf',
    '0293r;alkjsdf');
  jest.resetModules()
});


describe('Authy Tests', () => {
  test('Test Facade', async () => {
    const id = await authy.getSocialIdentity('token');
    expect(id).toEqual({
      access_token: 'aldbjf908dfl',
      username: 'ekeitho',
    });
  });
});

describe('Test Authy Errors', () => {

  test('Bad User Input - Undefined Access Token', async () => {
    let error;

    try {
      await authy.getSocialIdentity(undefined);
    } catch (e) {
      error = e;
    } finally {
      expect(error).toBeDefined();
    }

  });

  test('Bad Server Input - Undefined Identity', async () => {

    jest.doMock('auth0', () => {
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
              return 'access_token';
            },
          };
        },
        ManagementClient: function() {
          return {
            getUser() {
              return {
                identities: undefined,
              };
            },
          };
        },
      };
    });
    require('auth0');

    let error;
    authy = new Authy('appName',
      '093jlaksjdf',
      '0293r;alkjsdf');
    try {

      await authy.getSocialIdentity('dlkajdf');
    } catch (e) {
      error = e;
    } finally {
      expect(error).toBeDefined();
    }

  });

});

