import gql from "graphql-tag";

export const PAIRS_VOLUME_QUERY = gql`
    query PairsVolume($limit: Int!, $pairIds: [ID!]!, $blockNumber: Int!) {
        pairVolumes: pairs(first: $limit, where: { id_in: $pairIds }, block: { number: $blockNumber }) {
            id
            volumeToken0
            volumeToken1
            volumeUSD
        }
    }
`;

export const TOKEN_BY_ADDRESS = gql`
    query Token($id: ID!) {
        token(id: $id) {
            id
            name
            symbol
            derivedETH
            derivedUSD
        }
    }
`;

export const GET_TVL = gql`
    query TaalFactory($limit: Int!) {
        taalFactories(first: $limit) {
            totalLiquidityUSD
        }
    }
`;

export const GET_ETH_PRICE = gql`
    query EthPrice($limit: Int!) {
        bundles(first: $limit) {
            ethPrice
        }
    }
`;

export const GET_TRX = gql`
    query TaalDayData1($limit: Int!) {
        taalDayDatas(
            first: $limit
            orderBy: date
            orderDirection: desc
        ) {
            totalTransactions
        }
    }
`;

export const GET_TRANSACTIONS = gql`
    query Transactions($limit: Int!) {
        mints(first: $limit, orderBy: timestamp, orderDirection: desc) {
            transaction {
                id
                timestamp
            }
            pair {
                token0 {
                    id
                    symbol
                }
                token1 {
                    id
                    symbol
                }
            }
            amountUSD
        }
        burns(first: $limit, orderBy: timestamp, orderDirection: desc) {
            transaction {
                id
                timestamp
            }
            pair {
                token0 {
                    id
                    symbol
                }
                token1 {
                    id
                    symbol
                }
            }
            amountUSD
        }
        swaps(first: $limit, orderBy: timestamp, orderDirection: desc) {
            transaction {
                id
                timestamp
            }
            id
            pair {
                token0 {
                    id
                    symbol
                }
                token1 {
                    id
                    symbol
                }
            }
            amountUSD
        }
    }
`;

export const GET_VOLUME_USD = gql`
    query TaalDayData2($limit: Int!) {
        taalDayDatas(
            first: $limit
            orderBy: date
            orderDirection: desc
        ) {
            dailyVolumeUSD
        }
    }
`;

export const TOP_PAIRS = gql`
    fragment TokenInfo on Token {
        id
        name
        symbol
        decimals
        derivedETH
        derivedUSD
        totalLiquidity
    }

    query TopPairs($limit: Int!, $excludeTokenIds: [String!]!) {
        pairs(
            first: $limit
            orderBy: reserveUSD
            orderDirection: desc
            where: { token0_not_in: $excludeTokenIds, token1_not_in: $excludeTokenIds }
        ) {
            id
            token0 {
                ...TokenInfo
            }
            token1 {
                ...TokenInfo
            }
            reserve0
            reserve1
            volumeToken0
            volumeToken1
            reserveETH
            reserveUSD
            volumeUSD
        }
    }
`;
