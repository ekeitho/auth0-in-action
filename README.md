[![Build Status](https://travis-ci.org/ekeitho/auth0-in-action.svg?branch=master)](https://travis-ci.org/ekeitho/auth0-in-action)
[![Coverage Status](https://coveralls.io/repos/github/ekeitho/auth0-in-action/badge.svg?branch=master)](https://coveralls.io/github/ekeitho/auth0-in-action?branch=master)
[![npm version](https://badge.fury.io/js/auth0-in-action.svg)](https://badge.fury.io/js/auth0-in-action)

# auth0-in-action
build authenticated google actions faster with [auth0](https://auth0.com)



### Why did I build this?

There are a lot of great social integrations to be created on actions on google, 
but working with authentication is a friction point in building out these ideas. 
I want to help developers focus on building their awesome idea and avoid the potential 
case of someone getting frustrated with the process and give up.

### How to use it!

```typescript
import Authy from 'auth0-in-action'

// your actions on google code
app.intent('actions.intent.SIGN_IN', async (conv, params, signin) => {
    if (signin.status !== 'OK') {
        return conv.close('You need to sign in before using the app.');
    }
    
    const authy = new Authy("yourAuth0TenantDomainName", 
                            "auth0clientId", 
                            "auth0clientSecret");
                            
    const {access_token, username} = await authy.getSocialIdentity(conv.user.access.token);
    
    // do whatever you want with the access token -- like getting a users github repos
    conv.ask(`Thanks ${username} for signing for. What can I help you with today?`);
});

```


