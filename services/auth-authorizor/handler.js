import { lucia } from "../../lucia/lucia.js";
export const handler = async (event) => {
  const cookies = event.headers.Cookie || event.headers.cookie;
  let sessionId;

  // Extract session cookie
  if (cookies) {
    const match = cookies.match(/auth_session=([^;]+)/);
    sessionId = match ? match[1] : null;
  }

  if (!sessionId) {
    return generatePolicy("user", "Deny", event.methodArn);
  }

  try {
    const { session, user } = await lucia.validateSession(sessionId);
    if (session) {
      return generatePolicy(user.userId, "Allow", event.methodArn);
    } else {
      return generatePolicy("user", "Deny", event.methodArn);
    }
  } catch (error) {
    console.error("Session validation error", error);
    return generatePolicy("user", "Deny", event.methodArn);
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
