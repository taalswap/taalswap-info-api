import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client/core";
import fetch from "cross-fetch";

export const client = new ApolloClient({
  link: new HttpLink({
    fetch,
    uri: `https://gateway-arbitrum.network.thegraph.com/api/${process.env.SUBGRAPH_KEY}/subgraphs/id/7T2Z8RmQ4tkAeZtg9rmMHZpTNSXhPjX8k7vZfS5PY8vT`
  }),
  cache: new InMemoryCache()
});
