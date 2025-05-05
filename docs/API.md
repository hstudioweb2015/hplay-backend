# HPlay Backend API Documentation

## Base URL
`/api/v1`

## Authentication
Authentication is required for most endpoints and uses JWT tokens. Include the token in the Authorization header:
`Authorization: Bearer <token>`

## Endpoints

### Authentication
#### Login
- **POST** `/auth/login`
    - Body: `{ "email": string, "password": string }`
    - Returns: `{ "token": string, "user": User }`

#### Register
- **POST** `/auth/register`
    - Body: `{ "firstName": string, "lastName": string, "email": string, "password": string }`
    - Returns: `{ "token": string, "user": User }`

### Media
#### Get All Media
- **GET** `/media`
    - Query params:
        - `limit`: number (default: 10)
        - `page`: number (default: 1)
        - `tags`: string[] (optional)
    - Returns: `Media[]`

#### Get Single Media
- **GET** `/media/{id}`
    - Returns: `Media`

#### Create Media (Admin only)
- **POST** `/media`
    - Body: `{ "name": string, "description": string, "price": number, "tags": string[], media: File }`
    - Returns: `Media`

#### Update Media (Admin only)
- **PUT** `/media/{id}`
    - Body: `{ "name": string, "description": string, "price": number, "tags": string[] }`
    - Returns: `Media`

#### Delete Media (Admin only)
- **DELETE** `/media/{id}`

### Users
#### Get User Profile
- **GET** `/users/{id}`
    - Returns: `User`

#### Update User
- **PUT** `/users/{id}`
    - Body: `{ "firstName": string, "lastName": string, "email": string, "password": string }`
    - Returns: `User`

#### Delete User (Admin only)
- **DELETE** `/users/{id}`