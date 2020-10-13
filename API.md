# ArtsyApp API Documentation
API Documentation for CS4518 Group 3 final project.

## Version: 0.2.1

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
| 500 | Failed to retrieve user by the id attached to their session |  |

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

### /post

#### POST
##### Summary

Creates a new post from the user's current location and drawing bitmap.

##### Description

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| lat | required | Latitude coordinate for Post | No | float |
| lon | required | Longitude coordinate for Post | No | float |
| content | required | Raw bitmap data of drawing | No | string |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 201 | Post created successfully | [Post](#post) |
| 400 | Missing required parameters | [Error](#error) |
| 500 | Unable to create post (backend error) | [Error](#error) |

##### Security

| Security Schema | Scopes |
| --- | --- |
| cookieAuth | |

### /post/:id

#### DELETE
##### Summary

Deletes a post. A post may only be deleted by the user who created it.

##### Description

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| id | required | ID of post to delete | No | string |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Deletion completed successfully |  |
| 403 | Not authorized to delete post | [Error](#error) |
| 404 | Post not found | [Error](#error) |
| 500 | Failed to process request | [Error](#error) |

##### Security

| Security Schema | Scopes |
| --- | --- |
| cookieAuth | |

#### GET
##### Summary

Retrieves post by its ID. If Authenticated, vote related information will be shown.

##### Description

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| id | required | ID of post to request | No | string |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Post data retrieved | [Post](#post) |
| 404 | Post not found | [Error](#error) |

### /post/:id/downvote

#### GET
##### Summary

Downvotes as authenticated user. Acts as an unvote if user has already downvoted, and removes upvote if applicable.

##### Description

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| id | required | ID of post to upvote | No | string |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | The post score along with user's new vote_status for the post | [Vote](#vote) |
| 403 |  | [Error](#error) |
| 404 | Post not found | [Error](#error) |
| 500 | Error processing request | [Error](#error) |

##### Security

| Security Schema | Scopes |
| --- | --- |
| cookieAuth | |

### /post/:id/upvote

#### GET
##### Summary

Upvotes as authenticated user. Acts as an unvote if user has already upvoted, and removes downvote if applicable.

##### Description

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| id | required | ID of post to upvote | No | string |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | The post score along with user's new vote_status for the post | [Vote](#vote) |
| 403 |  | [Error](#error) |
| 404 | Post not found | [Error](#error) |
| 500 | Error processing request | [Error](#error) |

##### Security

| Security Schema | Scopes |
| --- | --- |
| cookieAuth | |

### /post/feed

#### GET
##### Summary

Paginates through a feed of posts around the specified coordinates

##### Description

##### Parameters

| Name | Located in | Description | Required | Schema |
| ---- | ---------- | ----------- | -------- | ---- |
| lat | query | Current latitude cooridnate of user | Yes | float |
| lon | query | Current longitude cooridnate of user | Yes | float |
| radius | query | Distance radius to find posts within | Yes | number |
| unit | query | Unit for distance radius option (enum: mi,km) | Yes | string |
| sort_by | query | Determines whether to sort by popularity, distance, or just by date (enum: popular, proximity, date) | No | string |
| page | query | Current page of feed to request (defaults to 1) | No | integer |
| limit | query | Number of posts to retrieve per page (defaults to 10) | No | integer |

##### Responses

| Code | Description | Schema |
| ---- | ----------- | ------ |
| 200 | Resulting page of feed | [ [Post.model](#postmodel) ] |
| 400 | Missing required parameters | [Error](#error) |
| 500 | Unable to request feed (backend error) | [Error](#error) |

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

#### Point

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| coordinates | Array | Longitude and Latitude of Location <br>_Example:_ `"[-120.24, 39.21]"` | Yes |
| type | string | Type of GeoJSON location <br>_Enum:_ `"Point"` | Yes |

#### Post

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| content | string | Raw image data of drawing (base64) | Yes |
| created_at | string | Date created <br>_Example:_ `"2020-10-06 15:25:58.542Z"` | No |
| distance | float | Distance to user (only provided if querying from feed) <br>_Example:_ `"41.2"` | No |
| distance_unit | float | Unit for the distance field (only provided if querying from feed) <br>_Example:_ `"mi"` | No |
| id | string | ID of the post <br>_Example:_ `"5d7d52e543be22485d393712"` | Yes |
| lat | float | Latitude coordinate where post was created <br>_Example:_ `"-71.8081"` | Yes |
| lon | float | Longitude coordinate where post was created <br>_Example:_ `"42.2743"` | Yes |
| owned | boolean | True if post belongs to the requesting user | No |
| score | integer | Net score of upvotes and downvotes | Yes |
| updated_at | string | Date last updated <br>_Example:_ `"2020-10-06 19:50:14.217Z"` | No |
| vote_status | string | Vote status for user making call (unvoted/upvoted/downvoted) <br>_Enum:_ `"0"`, `"1"`, `"2"` | No |

#### User

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| created_at | string | Date created <br>_Example:_ `"2020-10-06 15:25:58.542Z"` | Yes |
| email | string | Email Address (gmail) <br>_Example:_ `"kotlin4lyfe@gmail.com"` | Yes |
| google_id | string | ID of corresponding Google Account | Yes |
| id | string | ID for the user <br>_Example:_ `"5f824707c871eb58cd61740a"` | Yes |
| name | string | Full name of user <br>_Example:_ `"John Doe"` | Yes |
| profile_url | string | URL to profile picture of corresponding Google Account | No |
| updated_at | string | Date last updated <br>_Example:_ `"2020-10-06 19:50:14.217Z"` | Yes |

#### Vote

| Name | Type | Description | Required |
| ---- | ---- | ----------- | -------- |
| score | integer | The current net between upvotes and downvotes on corresponding post | Yes |
| vote_status | string | The vote status for the requesting user on corresponding post (unvoted/upvoted/downvoted) <br>_Enum:_ `"0"`, `"1"`, `"2"` | Yes |
