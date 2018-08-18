import auth0 = require('auth0');

jest.mock('auth0', () => {
  return {
    AuthenticationClient: jest.fn().mockImplementation(() => {
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
          return 'oauth_token';
        },
      };
    }),
    ManagementClient: jest.fn().mockImplementation(() => {
      return {
        getUser() {
          return {
            identities: [{ access_token: 'aldbjf908dfl', username: '' }],
          };
        },
      };
    }),
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
      oauth_token: 'aldbjf908dfl',
      username: 'ekeitho',
    });
  });
});

describe('Test Authy Errors', () => {

  test('Bad User Input - Undefined Access Token', async () => {
    await expectToThrow(async () => {
      // @ts-ignore
      await authy.getSocialIdentity(undefined);
    })

  });

  test('Bad Server Input - Undefined Identity', async () => {
    // @ts-ignore - pre importing auth0 and then mocking makes ide
    //              think that property 'mock...' doesn't exist on MClient
    auth0.ManagementClient.mockImplementationOnce(() => {
        return {
          getUser: () => {
            return {
              identities: undefined,
            };
          }
        }
    });

    await expectToThrow(async () => {
      await authy.getSocialIdentity('adsf')
    })
  });

});

async function expectToThrow(cb: () => any) {
  let error;

  try {
    await cb();
  } catch(e) {
    error = e;
  } finally {
    expect(error).toBeDefined();
  }

}


