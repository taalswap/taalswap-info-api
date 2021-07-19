import { VercelRequest, VercelResponse } from "@vercel/node";
import { getAddress } from "@ethersproject/address";
import { getEthPrice, getTopPairs } from "../../utils";
import { return200, return500 } from "../../utils/response";
import BigNumber from "bignumber.js";

interface ReturnShape {
  [tokenAddress: string]: {
    name: string;
    address: string;
    symbol: string;
    price: string;
    price_ETH: string;
    liquidity: string;
  };
}

export default async function(req: VercelRequest, res: VercelResponse): Promise<void> {
  try {
    const topPairs = await getTopPairs();
    const ethPrice = await getEthPrice();

    const tokens = topPairs.reduce<ReturnShape>((accumulator, pair): ReturnShape => {
      for (const token of [pair.token0, pair.token1]) {
        const tId = getAddress(token.id);
        const liq = ethPrice * token.totalLiquidity * token.derivedETH
        accumulator[tId] = {
          name: token.name,
          address: tId,
          symbol: token.symbol,
          price: token.derivedUSD,
          price_ETH: token.derivedETH,
          liquidity: liq.toString()
        };
      }

      return accumulator;
    }, {});

    return200(res, { updated_at: new Date().getTime(), data: tokens });
  } catch (error) {
    return500(res, error);
  }
}
