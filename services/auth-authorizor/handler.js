import { lucia } from "../../lucia/lucia.js";

export const handler = async (event, context, callback) => {
  const cookies = event.headers.Cookie || event.headers.cookie;
  let sessionId;
  console.log("Event", event);
  console.log("Context", context);
  console.log("Callback", callback);
  // Extract session cookie
  if (cookies) {
    const match = cookies.match(/auth_session=([^;]+)/);
    sessionId = match ? match[1] : null;
  }

  console.log("Session ID", sessionId);

  if (!sessionId) {
    return callback(null, generatePolicy("user", "Deny", event.methodArn));
  }

  try {
    const { session, user } = await lucia.validateSession(sessionId);
    console.log("Session", session);
    console.log("User", user);
    if (session) {
      return callback(
        null,
        generatePolicy(user.id, "Allow", event.methodArn),
      );
    } else {
      return callback(null, generatePolicy("user", "Deny", event.methodArn));
    }
  } catch (error) {
    console.error("Session validation error", error);
    return callback(null, generatePolicy("user", "Deny", event.methodArn));
  }
};

// Helper function to generate IAM policy
const generatePolicy = (principalId, effect, resource) => {
  const authResponse = {};
  authResponse.principalId = principalId;

  if (effect && resource) {
    const policyDocument = {
      Version: "2012-10-17",
      Statement: [
        {
          Action: "execute-api:Invoke",
          Effect: effect,
          Resource: resource,
        },
      ],
    };
    authResponse.policyDocument = policyDocument;
  }
  return authResponse;
};
