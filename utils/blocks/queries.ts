import gql from "graphql-tag";
import { blockClient } from "./client";

export const GET_BLOCK = gql`
  query blocks($timestampFrom: Int!, $timestampTo: Int!) {
    blocks(
      first: 1
      orderBy: timestamp
      orderDirection: asc
      where: { timestamp_gt: $timestampFrom, timestamp_lt: $timestampTo }
    ) {
      id
      number
      timestamp
    }
  }
`;

/**
 * Returns the block corresponding to a given epoch timestamp (seconds)
 * @param timestamp epoch timestamp in seconds
 */
export async function getBlockFromTimestamp(timestamp: number): Promise<string | undefined> {
  const result = await blockClient.query({
    query: GET_BLOCK,
    variables: {
      timestampFrom: timestamp,
      timestampTo: timestamp + 600
    },
    fetchPolicy: "cache-first",
  });
  return result?.data?.blocks?.[0]?.number;
}
