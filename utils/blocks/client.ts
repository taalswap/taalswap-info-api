import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client/core";
import fetch from "cross-fetch";

export const blockClient = new ApolloClient({
  link: new HttpLink({
    fetch,
    uri: `https://gateway-arbitrum.network.thegraph.com/api/${process.env.SUBGRAPH_KEY}/subgraphs/id/HeBTP8LPmBiW8AQjuJ1fNNoNHfHji1V38Dfxkhsufoq`
  }),
  cache: new InMemoryCache()
});
