const document={
  swagger: "2.0",
  info: {
    version: "1.0.0",
    title: "Visitor Management API",
    description: "API for handling visitor management"
  },
  "securityDefinitions": {
    "Bearer": {
      "type": "apiKey",
      "name": "Authorization",
      "in": "header"
    }
  },

  "paths": {
    "/login": {
      "post": {
        "summary": "Authenticate user",
        "description": "Authenticate a user based on provided credentials",
        "tags": ["Authentication"],
        "parameters": [
          {
            "name": "body",
            "in": "body",
            "description": "User credentials for authentication",
            "required": true,
            "schema": {
              "type": "object",
              "properties": {
                "user_id": {
                  "type": "string",
                  "description": "User ID",
                  "example": "A3100"
                },
                "password": {
                  "type": "string",
                  "description": "User password",
                  "example": "lyla"
                }
              }
            }
          }
        ],
    // "/login": {
    //   "get": {
    //     "summary": "User login",
    //     "description": "Authenticate a user and generate a JWT token",
    //     "tags": ["User Management"],
    //     "produces": ["application/json"],
    //     "parameters": [
    //       {
    //         "name": "user_id",
    //         "in": "query",
    //         "description": "User ID",
    //         "required": true,
    //         "type": "string"
    //       },
    //       {
    //         "name": "password",
    //         "in": "query",
    //         "description": "User password",
    //         "required": true,
    //         "type": "string"
    //       }
    //     ],
    "responses": 
    {
      
      "200": {
        
        "description": "Authentication successful",
     
        "schema": {
          "type": "object",
          "properties": {
            "success": { "type": "boolean", "example": true },
            "verify": { "type": "object" },  // The user object
            "token": { "type": "string", "example": "generated_token" }
          }
        }
      },
      "401": {
        "description": "Authentication failed",
        "schema": {
          "type": "object",
          "properties": {
            "success": { "type": "boolean", "example": false },
            "error": { "type": "string" }  // Error message
          }
        }
      },
      "500": {
        "description": "Internal server error",
        "schema": {
          "type": "object",
          "properties": {
            "success": { "type": "boolean", "example": false },
            "error": { "type": "string" }  // Error message
          }
        }
      }
    }
        
  }
},
  
  "/finduser": {
    "get": {
      "summary": "Find user by user_id",
      "description": "Find a user by user_id (admin only)",
      "tags": ["User Management"],
      "parameters": [
        {
          "name": "user_id",
          "in": "query",
          "description": "User ID to find",
          "required": true,
          "type": "string"
        }
      ],
      "security":
      {
      "Bearer": []
      },
      "responses": {
        "200": {"description": "Successful response"},
        "401": {"description": "Unauthorized"},
        "403": {"description": "Forbidden"},
        "404": {"description": "User not found"}
      }
    }
  },
  "/registeruser": {
    "post": {
      "summary": "Register a new user",
      "description": "Register a new user (admin only)",
      "tags": ["User Management"],
      "parameters": [
        {
          "name": "User",
          "in": "body",
          "description": "User details for registration",
          "required": true,
          "schema": {"$ref": "#/definitions/User"}
        }
      ],
      "security":
      {
      "Bearer": []
      },
      "responses": {
        "201": {"description": "User registered successfully"},
        "401": {"description": "Unauthorized"},
        "403": {"description": "Forbidden"},
        "409": {"description": "User already exists"}
      }
    }
  },
  "/updateuser": {
    "patch": {
      "summary": "Update user information",
      "description": "Update user information (admin only)",
      "tags": ["User Management"],
      "parameters": [

        {
          "name": "User",
          "in": "body",
          "description": "User details for update",
          "required": true,
          "schema": {"$ref": "#/definitions/User"}
        }
      ],
      "security":
      {
      "Bearer": []
      },
      "responses": {
        "200": {"description": "User updated successfully"},
        "401": {"description": "Unauthorized"},
        "403": {"description": "Forbidden"},
        "404": {"description": "User not found"}
      }
    }
  },
  "/deleteuser": {
    "delete": {
      "summary": "Delete user by user_id",
      "description": "Delete a user by user_id (admin only)",
      "tags": ["User Management"],
      "parameters": [
        {
          "name": "user_id",
          "in": "query",
          "description": "User ID to delete",
          "required": true,
          "type": "string"
        }
      ],
      "security":
      {
      "Bearer": []
      },
      "responses": {
        "200": {"description": "User deleted successfully"},
        "401": {"description": "Unauthorized"},
        "403": {"description": "Forbidden"},
        "404": {"description": "User not found"}
      }
    }
  },
  "/registervisitor": {
    "post": {
      "summary": "Register a new visitor",
      "description": "Register a new visitor (admin only)",
      "tags": ["Visitor Management"],
      "parameters": [

        {
          "name": "Visitor",
          "in": "body",
          "description": "Visitor details for registration",
          "required": true,
          "schema": {"$ref": "#/definitions/Visitor"}
        }
      ],
      "security":
      {
      "Bearer": []
      },
      "responses": {
        "201": {"description": "Visitor registered successfully"},
        "401": {"description": "Unauthorized"},
        "403": {"description": "Forbidden"},
        "409": {"description": "Visitor already exists"}
      }
    }
  },
  "/findvisitor": {
    "get": {
      "summary": "Find visitors based on criteria",
      "description": "Find visitors based on specified criteria (admin or security only)",
      "tags": ["Visitor Management"],
      "parameters": [

        {
          "name": "criteria",
          "in": "query",
          "description": "Criteria to search for visitors",
          "required": true,
          "type": "string"
        }
      ],
      "security":
      {
      "Bearer": []
      },
      "responses": {
        "200": {"description": "Successful response"},
        "401": {"description": "Unauthorized"},
        "403": {"description": "Forbidden"},
        "404": {"description": "No visitors found"}
      }
    }
  }
},
"definitions": {
  "User": {
    "type": "object",
    "properties": {
      "user_id": {"type": "string"},
      "password": {"type": "string"},
      "name": {"type": "string"},
      "unit": {"type": "string"},
      "hp_num": {"type": "string"},
      "role": {"type": "string"}
    }
  },
  "Visitor": {
    "type": "object",
    "properties": {
      "ref_num": {"type": "string"},
      "name": {"type": "string"},
      "IC_num": {"type": "string"},
      "car_num": {"type": "string"},
      "hp_num": {"type": "string"},
      "pass": {"type": "string"},
      "category": {"type": "string"},
      "visit_date": {"type": "string"},
      "unit": {"type": "string"},
      "user_id": {"type": "string"}
    }
  }
}
}


module.exports = document;