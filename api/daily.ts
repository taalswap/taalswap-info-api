import { VercelRequest, VercelResponse } from "@vercel/node";
import { return200, return500 } from "../utils/response";
import { getOneDayTransactionCnt, getOneDayVolumeUSD } from "../utils";

export default async function (req: VercelRequest, res: VercelResponse): Promise<void> {
  try {
    return200(res, { updated_at: new Date().getTime(), data: {transactions: await getOneDayTransactionCnt(), volumeUSD: await getOneDayVolumeUSD() }});
  } catch (error) {
    return500(res, error);
  }
}