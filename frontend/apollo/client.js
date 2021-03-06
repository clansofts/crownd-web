import ApolloClient from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { createUploadLink } from 'apollo-upload-client';
import { withClientState } from 'apollo-link-state';
import { onError } from 'apollo-link-error';
import { ApolloLink } from 'apollo-link';
import { defaults, resolvers } from "./store";
import { endpoint, prodEndpoint } from '../config';

import withApollo from 'next-with-apollo';

const cache = new InMemoryCache();

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.map(({ message, locations, path }) =>
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
      ),
    );
  if (networkError) {
    console.log(`[Network error]: ${networkError}`);
  }
})

const stateLink = withClientState({
  defaults,
  resolvers,
  cache
});

const uploadLink = createUploadLink({
  uri: process.env.NODE_ENV === 'production' ? prodEndpoint : endpoint,
  credentials: 'include'
});

const createClient = ({ headers }) => {
  const client = new ApolloClient({
    link: ApolloLink.from([
      new ApolloLink((operation, forward) => {
        operation.setContext({
          headers
        });

        return forward(operation);
      }),
      errorLink,
      stateLink,
      uploadLink
    ]),
    cache
  });

  client.onResetStore(stateLink.writeDefaults);

  return client;
};

export default withApollo(createClient);