import { VercelRequest, VercelResponse } from "@vercel/node";
import { getAddress } from "@ethersproject/address";
import { getTopPairs } from "../utils";
import { return200, return500 } from "../utils/response";

interface ReturnShape {
  [tokenIds: string]: {
    pair_address: string;
    reserve0: string;
    reserve1: string;
    base_name: string;
    base_symbol: string;
    base_decimals: string;
    base_price: string;
    base_address: string;
    quote_name: string;
    quote_symbol: string;
    quote_decimals: string;
    quote_price: string;
    quote_address: string;
    price: string;
    base_volume: string;
    quote_volume: string;
    liquidity: string;
    liquidity_ETH: string;
    previous24hVolumeUSD: string;
  };
}

export default async function(req: VercelRequest, res: VercelResponse): Promise<void> {
  try {
    const topPairs = await getTopPairs();

    const pairs = topPairs.reduce<ReturnShape>((accumulator, pair): ReturnShape => {
      const pId = getAddress(pair.id);
      const t0Id = getAddress(pair.token0.id);
      const t1Id = getAddress(pair.token1.id);

      accumulator[`${t0Id}_${t1Id}`] = {
        pair_address: pId,
        reserve0: pair.reserve0,
        reserve1: pair.reserve1,
        base_name: pair.token0.name,
        base_symbol: pair.token0.symbol,
        base_decimals: pair.token0.decimals,
        base_price: pair.token0.derivedUSD,
        base_address: t0Id,
        quote_name: pair.token1.name,
        quote_symbol: pair.token1.symbol,
        quote_decimals: pair.token1.decimals,
        quote_price: pair.token1.derivedUSD,
        quote_address: t1Id,
        price: pair.price,
        base_volume: pair.previous24hVolumeToken0,
        quote_volume: pair.previous24hVolumeToken1,
        liquidity: pair.reserveUSD,
        liquidity_ETH: pair.reserveETH,
        previous24hVolumeUSD: pair.previous24hVolumeUSD
      };

      return accumulator;
    }, {});

    return200(res, { updated_at: new Date().getTime(), data: pairs });
  } catch (error) {
    return500(res, error);
  }
}
