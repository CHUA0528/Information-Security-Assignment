const document={
    swagger: "2.0",
    info: {
      version: "1.0.0",
      title: "Visitor Management API",
      description: "API for handling visitor management"
    },
    "paths": {
      "/login": {
        "get": {
          "summary": "User login",
          "description": "Authenticate a user and generate a JWT token",
          "produces": ["application/json"],
          "parameters": [
            {
              "name": "user_id",
              "in": "query",
              "description": "User ID",
              "required": true,
              "type": "string"
            },
            {
              "name": "password",
              "in": "query",
              "description": "User password",
              "required": true,
              "type": "string"
            }
          ],
          "responses": {
            "200": {
              "description": "Successful login",
              "schema": {
                "type": "object",
                "properties": {
                  "message": {
                    "type": "string",
                    "example": "User has logged in!"
                  },
                  "welcome": {
                    "type": "string",
                    "example": "Welcome John Doe!"
                  },
                  "token": {
                    "type": "string",
                    "example": "your_generated_jwt_token"
                  }
                }
              }
            },
            "400": {
              "description": "Invalid login credentials",
              "schema": {
                "type": "object",
                "properties": {
                  "error": {
                    "type": "string",
                    "example": "No such user ID found D:"
                  }
                }
              }
            },
            "401": {
              "description": "Authentication failed",
              "schema": {
                "type": "object",
                "properties": {
                  "error": {
                    "type": "string",
                    "example": "Wrong password D: Forgotten your password?"
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  module.exports = document;