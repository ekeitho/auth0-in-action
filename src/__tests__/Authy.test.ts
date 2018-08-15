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
                access_token: '',
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


test('Test Authy', async () => {

  const spy = jest.spyOn(authy, 'getPublicIdentity');
  await authy.getSocialIdentity('token');

  expect(spy).toReturnWith({
    sub: '987654321',
    nickname: 'ekeitho',
    name: 'keith',
    picture: 'img',
  });

});