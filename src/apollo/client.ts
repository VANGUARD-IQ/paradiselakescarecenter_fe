// src/apollo/client.ts
import { ApolloClient, InMemoryCache, from, split } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";
import createUploadLink from "apollo-upload-client/createUploadLink.mjs";
import { getApiUrl } from "../helpers";
import { getMainDefinition } from "@apollo/client/utilities";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { brandConfig } from "../brandConfig";

// Create the upload link
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const uploadLink = (createUploadLink as any)({
  uri: brandConfig.apiUrl || getApiUrl(),
});

// Create error link to log all GraphQL errors
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  console.log('🔴 ==================== GRAPHQL ERROR ====================');
  console.log('Operation:', operation.operationName);
  
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path, extensions }) => {
      console.error(
        `GraphQL error: Message: ${message}, Location: ${locations}, Path: ${path}`
      );
      console.error('Extensions:', extensions);
    });
  }

  if (networkError) {
    console.error('Network error:', networkError);
    // Type assertion to access response property
    const netError = networkError as any;
    if (netError.response) {
      console.error('Response status:', netError.response.status);
      console.error('Response body:', netError.response.body);
    }
  }
  
  console.log('Request headers:', operation.getContext().headers);
  console.log('🔴 ========================================================');
});

// Create the auth link to inject headers
const authLink = setContext((operation, { headers }) => {
  const token = localStorage.getItem("auth_token");
  
  const operationName = operation.operationName;
  const isFileUpload = operationName?.includes("Upload") || operationName?.includes("upload");
  
  // Always include tenant ID - even public operations need it for multi-tenant isolation
  // The tenant middleware will allow public operations to proceed without auth
  const finalHeaders = {
    ...headers,
    "x-tenant-id": brandConfig.tenantId,
    "apollo-require-preflight": "true",
    "x-apollo-operation-name": operationName,
    // Don't set content-type for file uploads - apollo-upload-client handles it automatically
    ...(isFileUpload ? {} : { "content-type": "application/json" }),
    authorization: token ? `Bearer ${token}` : "",
  };

  console.log(`📡 GraphQL Request: ${operationName}`);
  console.log('Headers being sent:', finalHeaders);

  return { headers: finalHeaders };
});

const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        services: {
          merge(_, incoming) {
            return [...incoming];
          },
          keyArgs: false,
        }
      }
    }
  }
});

// Create WebSocket link
const wsLink = new GraphQLWsLink(createClient({
  url: (brandConfig.apiUrl || getApiUrl()).replace("http", "ws"), // Convert HTTP URL to WebSocket URL
}));

// Combine the links - INCLUDE ERROR LINK!
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  from([errorLink, authLink, uploadLink])  // Added errorLink here!
);

// Update Apollo Client configuration
export const apolloClient = new ApolloClient({
  link: splitLink,
  cache,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: "cache-and-network",
    },
  }
});

console.log("API URL:", brandConfig.apiUrl || getApiUrl());
console.log("Tenant ID:", brandConfig.tenantId);