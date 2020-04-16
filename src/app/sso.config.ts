import { AuthConfig } from 'angular-oauth2-oidc';

export const authCodeFlowConfig: AuthConfig = {
  // Url of the Identity Provider
  issuer: 'https://accounts.google.com',

  // URL of the SPA to redirect the user to after login
  redirectUri: 'http://localhost:4200/api/login',

  // The SPA's id. The SPA is registerd with this id at the auth-server
  clientId: '335272626855-fd6ib1mb9h5m54rgbooahj5jrm7e9o8k.apps.googleusercontent.com',
  userinfoEndpoint: 'https://openidconnect.googleapis.com/v1/userinfo',
  requestAccessToken: false,

  requireHttps: true,

  responseType: 'code',

  // set the scope for the permissions the client should request
  // The first four are defined by OIDC.
  // Important: Request offline_access to get a refresh token
  // The api scope is a usecase specific one
  scope: 'openid profile email',

  showDebugInformation: true,
  strictDiscoveryDocumentValidation: false,

  // Not recommented:
  disablePKCE: false
};
