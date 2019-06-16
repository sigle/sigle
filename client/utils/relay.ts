import {
  Environment,
  Network,
  RecordSource,
  Store,
  RequestNode,
  Variables,
} from 'relay-runtime';

function fetchQuery(operation: RequestNode, variables: Variables) {
  return fetch('/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: operation.text,
      variables,
    }),
  }).then(response => {
    return response.json();
  });
}

export const environment = new Environment({
  network: Network.create(fetchQuery),
  store: new Store(new RecordSource()),
});
