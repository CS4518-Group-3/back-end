# ArtsyApp API Documentation
API Documentation for CS4518 Group 3 final project.

## Version: 0.1.0

**License:** MIT

### Security
**cookieAuth**  

|apiKey|*API Key*|
|---|---|
|Description|Express session cookie|
|In|cookie|
|Name|connect.sid|

### /auth/account

#### DELETE
##### Summary

Deletes the account of the attached user session

##### Description

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Account deleted successfully |  |
| 400 | Unable to find user attached to session | [Error](#error) |
| 500 | Error deleting user | [Error](#error) |

##### Security

| Security Schema | Scopes |
| --- | --- |
| cookieAuth | |

### /auth/callback

#### GET
##### Summary

Validates a user with Google credentials. Creates a new account if no matching account exists

##### Description

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| id_token | query | Google OAuth2 idToken. | Yes | string |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Successful login | [AuthenticationResponse](#authenticationresponse) |
| 201 | New user account was created and authenticated | [AuthenticationResponse](#authenticationresponse) |
| 400 | id_token is missing, invalid, or expired | [Error](#error) |
| 500 | Unable to verify with Google, or persist new user account | [Error](#error) |

### /auth/check

#### GET
##### Summary

Check if user is currently authenticated.

##### Description

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Includes user if authenticated | [AuthenticationResponse](#authenticationresponse) |

### /auth/signout

#### GET
##### Summary

Signs out user

##### Description

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |

##### Responses

| Code | Description |
| ---- | ----------- |
| 200 | Sign out successful |

##### Security

| Security Schema | Scopes |
| --- | --- |
| cookieAuth | |

### Models

#### AuthenticationResponse

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| authenticated | boolean | True if user is authenticated. False otherwise | No |
| user | [User](#user) |  | No |

#### Error

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| error | string | Error message <br>_Example:_ `"Error message"` | No |

#### User

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| _id | string | ID for the user | Yes |
| createdAt | string | Date created <br>_Example:_ `"2020-10-06 15:25:58.542Z"` | No |
| email | string | Email Address (gmail) <br>_Example:_ `"kotlin4lyfe@gmail.com"` | Yes |
| google_id | string | ID of user's corresponding Google Account | Yes |
| name | string | Full name of user <br>_Example:_ `"John Doe"` | No |
| updatedAt | string | Date last updated <br>_Example:_ `"2020-10-06 19:50:14.217Z"` | No |
