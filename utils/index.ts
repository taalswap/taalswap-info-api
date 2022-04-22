import BigNumber from "bignumber.js";
import { BLACKLIST } from "./constants/blacklist";
import { client } from "./apollo/client";
import {
  GET_ETH_PRICE,
  GET_TRX,
  GET_TVL,
  GET_VOLUME_USD,
  PAIRS_VOLUME_QUERY,
  TOKEN_BY_ADDRESS,
  GET_TRANSACTIONS,
  TOP_PAIRS
} from "./apollo/queries";
import { getBlockFromTimestamp } from "./blocks/queries";
import {
  PairsVolumeQuery,
  PairsVolumeQueryVariables,
  TokenQuery,
  TokenQueryVariables,
  TopPairsQuery,
  TopPairsQueryVariables
} from "./generated/subgraph";
import dayjs from "dayjs";


const TOP_PAIR_LIMIT = 1000;
export type Token = TokenQuery["token"];
export type Pair = TopPairsQuery["pairs"][number];

export interface MappedDetailedPair extends Pair {
  price: string;
  previous24hVolumeToken0: string;
  previous24hVolumeToken1: string;
  previous24hVolumeUSD: string;
}

export async function getTVL(): Promise<string | undefined> {
  const result = await client.query({
    query: GET_TVL,
    variables: {
      limit: 1
    },
    fetchPolicy: "network-only"
  });
  return result?.data?.taalFactories?.[0]?.totalLiquidityUSD;
}

export async function getEthPrice(): Promise<any | undefined> {
  const result = await client.query({
    query: GET_ETH_PRICE,
    variables: {
      limit: 1
    },
    fetchPolicy: "network-only"
  });
  return result?.data?.bundles?.[0]?.ethPrice;
}

export async function getOneDayTransactionCnt(): Promise<number | undefined> {
  const result = await client.query({
    query: GET_TRX,
    variables: {
      limit: 3
    },
    fetchPolicy: "cache-first"
  });
  const dayData = result?.data?.taalDayDatas;
  if (dayData.length === 0) {
    return 0;
  } else if (dayData.length < 3) {
    return dayData[0]?.totalTransactions;
  } else {
    return dayData[0]?.totalTransactions - dayData[2]?.totalTransactions;
  }
}

export async function getOneDayVolumeUSD(): Promise<string | undefined> {
  const result = await client.query({
    query: GET_VOLUME_USD,
    variables: {
      limit: 2
    },
    fetchPolicy: "cache-first"
  });
  const dayData = result?.data?.taalDayDatas;
  if (dayData.length === 0)
    return "0";
  else if (dayData.length < 2)
    return dayData[0].dailyVolumeUSD;
  else {
    const seconUSD = new BigNumber(dayData[1]?.dailyVolumeUSD);
    return new BigNumber(dayData[0]?.dailyVolumeUSD).plus(seconUSD).toString();
  }
}

export async function getTokenByAddress(address: string): Promise<Token> {
  const {
    data: { token },
    errors: tokenErrors
  } = await client.query<TokenQuery, TokenQueryVariables>({
    query: TOKEN_BY_ADDRESS,
    variables: {
      id: address
    },
    fetchPolicy: "cache-first"
  });

  if (tokenErrors && tokenErrors.length > 0) {
    throw new Error("Failed to fetch token from subgraph");
  }

  return token;
}

export async function getTransactions(limit: number): Promise<any | undefined> {
  const result = await client.query({
    query: GET_TRANSACTIONS,
    variables: {
      limit: limit
    },
    fetchPolicy: "cache-first"
  });

  const ret = [];

  ret.push(...result?.data?.swaps);
  ret.push(...result?.data?.mints);
  ret.push(...result?.data?.burns);

  const tmp = ret.sort((a: any, b: any): any => {
    return b.transaction.timestamp - a.transaction.timestamp;
  });
  return tmp.slice(0, limit);
}

export async function getTopPairs(): Promise<MappedDetailedPair[]> {
  const utcCurrentTime = dayjs(new Date());
  const utcOneDayBack = utcCurrentTime.subtract(1, "day").startOf('minute').unix();
  const firstBlock = await getBlockFromTimestamp(utcOneDayBack);

  if (!firstBlock) {
    throw new Error("Failed to fetch blocks from the subgraph");
  }

  const {
    data: { pairs },
    errors: topPairsErrors
  } = await client.query<TopPairsQuery, TopPairsQueryVariables>({
    query: TOP_PAIRS,
    variables: {
      limit: TOP_PAIR_LIMIT,
      excludeTokenIds: BLACKLIST
    },
    fetchPolicy: "cache-first"
  });

  if (topPairsErrors && topPairsErrors.length > 0) {
    throw new Error("Failed to fetch pairs from the subgraph");
  }

  const {
    data: { pairVolumes },
    errors: yesterdayVolumeErrors
  } = await client.query<PairsVolumeQuery, PairsVolumeQueryVariables>({
    query: PAIRS_VOLUME_QUERY,
    variables: {
      limit: TOP_PAIR_LIMIT,
      pairIds: pairs.map((pair) => pair.id),
      blockNumber: +firstBlock
    },
    fetchPolicy: "no-cache"
  });

  if (yesterdayVolumeErrors && yesterdayVolumeErrors.length > 0) {
    throw new Error(`Failed to get volume info for 24h ago from the subgraph`);
  }

  const yesterdayVolumeIndex =
    await pairVolumes?.reduce<{
      [pairId: string]: { volumeToken0: BigNumber; volumeToken1: BigNumber; volumeUSD: BigNumber };
    }>((memo, pair) => {
      memo[pair.id] = {
        volumeToken0: new BigNumber(pair.volumeToken0),
        volumeToken1: new BigNumber(pair.volumeToken1),
        volumeUSD: new BigNumber(pair.volumeUSD)
      };
      return memo;
    }, {}) ?? {};

  return (
    pairs?.map(
      (pair): MappedDetailedPair => {
        const yesterday = yesterdayVolumeIndex[pair.id];
        return {
          ...pair,
          price:
            pair.reserve0 !== "0" && pair.reserve1 !== "0"
              ? new BigNumber(pair.reserve1).dividedBy(pair.reserve0).toString()
              : "0",
          previous24hVolumeToken0:
            pair.volumeToken0 && yesterday?.volumeToken0
              ? new BigNumber(pair.volumeToken0).minus(yesterday.volumeToken0).toString()
              : new BigNumber(pair.volumeToken0).toString(),
          previous24hVolumeToken1:
            pair.volumeToken1 && yesterday?.volumeToken1
              ? new BigNumber(pair.volumeToken1).minus(yesterday.volumeToken1).toString()
              : new BigNumber(pair.volumeToken1).toString(),
          previous24hVolumeUSD:
            pair.volumeUSD && yesterday?.volumeUSD
              ? new BigNumber(pair.volumeUSD).minus(yesterday.volumeUSD).toString()
              : new BigNumber(pair.volumeUSD).toString()
        };
      }
    ) ?? []
  );
}
