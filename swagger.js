const { json } = require("express")

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
            "schema": 
              {
     
              "type": "object",
              "properties": {
                "user_id": {
                  "type": "string",
                  "description": "User ID",
                  "example": "STRING"
                },
                "password": {
                  "type": "string",
                  "description": "User password",
                  "example": "STRING"
                }
              }
            
          }
        }
      ],

    "responses": 
    {
      
      "200": {
        
        "description": "Authentication successful",
        "content": {
          "application/json": {
            "schema": {
              "type": "object",

            }
          }
        }
      },


      "401": {
        "description": "Authentication failed"
          
        },
      "500": {
        "description": "Internal server error",

      }
    }
        
  }
  },  
   "/finduser": {
      "get": {
        "summary": "Find user by user_id",
        "description": "Find a user by user_id (admin only)",
        "tags": ["Admin Access"],
        "parameters": [
          {
            "name": "user_id",
            "in": "query",
            "description": "User ID to find",
            "required": true,
            "type": "string",
            "example": "A3100"
          }
        ],
        "security": [
          {
            "Bearer": []
          }
        ],

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
      "tags": ["Admin Access"],
      "parameters": [
  
        {
          "name": "User",
          "in": "body",
          "description": "User details for registration",
          "required": true,
          "schema": {"$ref": "#/definitions/User"}
        }
      ],
      "security": [
        {
          "Bearer": []
        }
      ],
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
      "tags": ["Admin Access"],
      "parameters": [

        {
          "name": "User",
          "in": "body",
          "description": "User details for update",
          "required": true,
          "schema": {"$ref": "#/definitions/User"}
        }
      ],
      "security": [
        {
          "Bearer": []
        }
      ],
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
      "tags": ["Admin Access"],
      "parameters": [

        {
          "name": "user_id",
          "in": "query",
          "description": "User ID to delete",
          "required": true,
          "type": "string"
        }
      ],
      "security": [
      {
        "Bearer": []
      }
      ],
      "responses": {
        "200": {"description": "User deleted successfully"},
        "401": {"description": "Unauthorized"},
        "403": {"description": "Forbidden"},
        "404": {"description": "User not found"}
      }
    }
  },
  "/registerresident": {
    "post": {
      "summary": "Register a new resident (Available for security and admin access only)",
      "description": "Register a new resident ",
      "tags": ["Resident Management"],
      "parameters": [
  
        {
          "name": "Resident",
          "in": "body",
          "description": "Resident details for registration",
          "required": true,
          "schema": {"$ref": "#/definitions/Resident"}
        }
      ],
      "security": [
        {
          "Bearer": []
        }
      ],
      "responses": {
        "201": {"description": "User registered successfully"},
        "401": {"description": "Unauthorized"},
        "403": {"description": "Forbidden"},
        "409": {"description": "User already exists"}
      }
    }
  },
 
   "/public_register_resident": {
    "post": {
      "summary": "New resident registration (Security approval is required)",
      "description": "Register as new resident ",
      "tags": ["Resident Management"],
      "parameters":[
        {
          "name": "Resident",
          "in": "body",
          "description": "Resident details for registration",
          "required": true,
          "schema": {"$ref": "#/definitions/Resident"}

        }
      ],
    
    "responses": { 
      "200": {"description": "Your registration is pending approval"},
      "401": {"description": "Unauthorized"},
      "403": {"description": "Forbidden"},
      "409": {"description": "User already exists"}
   }
  }
  },

  "/public_register_resident_Testing": {
    "post": {
      "summary": "New resident registration (Security approval is not required)",
      "description": "Register as a new resident ",
      "tags": ["Resident Management"],
      "parameters":[
        {
          "name": "Resident",
          "in": "body",
          "description": "Resident details for registration",
          "required": true,
          "schema": {"$ref": "#/definitions/Resident"}
        }
      ],
      "responses": {
        "200": {"description": "Your registration is successful",
          "content":{
              "text/plain":{
                  "schema":{
                    "type": "string"
              }
            }
        }},
        "403": {"description": "Forbidden"},
        "409": {"description": "User already exists",
            "content":{
              "text/plain": {
                  "schema":{
                    "type": "string"
          }
        }
      }
    }
    
  }
}
},

  "/issuevisitor_pass": {
    "post": {
      "summary": "Issue visitor pass",
      "description": "Issue visitor pass ",
      "tags": ["Visitor Management"],
      "parameters": [
        {
          "name": "Visitor",
          "in": "body",
          "description": "Visitor details for pass issuing",
          "required": true,
          "schema": {"$ref": "#/definitions/Visitor"}
        }
      ],
      "security": [
        {
          "Bearer": []
        }
      ],
      "responses": {
        "201": {"description": "Visitor pass issued successfully"},
        "401": {"description": "Unauthorized"},
        "403": {"description": "Forbidden"},
        "409": {"description": "Visitor pass already exists"}
      }
    }
  },

  "/retrievevisitor_pass": {
    "get": {
      "summary": "Retrieve visitor pass",
      "description": "Please provide your reference number and IC number to retrieve your visitor pass",
      "tags": ["Visitor Management"],
      "parameters": [
        {
          "name": "ref_num",
          "in": "query",
          "description": "reference number for visitor pass",
          "required": true,
          "type": "string"
        },
        {
          "name": "IC_num",
          "in": "query",
          "description": "visitor IC number",
          "required": true,
          "type": "string"

        }
      ],
      "responses": {
        "200": {"description": "Successful response"},
        "401": {"description": "Unauthorized"},
        "403": {"description": "Forbidden"},
        "404": {"description": "No visitors found"}
      }
    }
  },

  "/visitorlist": {
    "get": {
      "summary": "List all visitors createrd ",
      "description": "List all visitors created by a resident",
      "tags": ["Visitor Management"],
      "security": [
        {
          "Bearer": []
        }
      ],
      "responses": {
        "200": {
          "description": "Successful response",
          "type": "array",

          schema: {
            type: "object",

            items: {
              $ref: "#/definitions/Visitor"
            }
          }
          }, 

        "401": {"description": "Unauthorized"},
        "403": {"description": "Forbidden"},
        "404": {"description": "No visitors found"}
      
     }
   }
 },

 "/securityvisitor_passverify":
 {
  "get":{
    "summary": "Verify visitor pass",
    "description": "Verify visitor pass based on specified criteria (security only)",
    "tags": ["Security Management"],
    "parameters": [
      {
        "name": "unit",
        "in": "query",
        "description": "unit of resident",
        "required": true,
        "type": "string"

      }
      ],
    "security": [
      {
        "Bearer": []
      }
    ],
    "responses": {
      "200":{
        "description": "Successful response"

        },
        "401": {"description": "Unauthorized"},
        "403": {"description": "Forbidden"},
      }
    }
   },
  

"/approvelist":
{
  "get":{
    "summary": "Resident registration approval list",
    "description":"List of residents pending approval ",
    "tags": ["Security Management"],

    "security": [
      {
        "Bearer": []
      }
    ],
    "responses": {
      "200":{
        "description": "Successful response",
        "content":{
          "application/json":{
            "schema":{
              "type": "array",
            }
          }
        },
      },
      "401": {"description": "Unauthorized",
      "content":{
        "text/plain":{
          "schema":{
            "type": "string",
          }
        }
      }
      },
      "402": {"description": "Forbidden"}
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
        "visit_date": {"type": "string"},
        "unit": {"type": "string"},
        "user_id": {"type": "string"}
      }
    },
    "Resident": {
      "type": "object",
      "properties": {
        "user_id": {"type": "string"},
        "password": {"type": "string"},
        "name": {"type": "string"},
        "unit": {"type": "string"},
        "hp_num": {"type": "string"},
      }
  }


  }

}




  module.exports = document;
