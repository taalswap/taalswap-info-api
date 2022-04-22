import { VercelRequest, VercelResponse } from "@vercel/node";
import { return200, return500 } from "../utils/response";
import { getTransactions } from "../utils";

export default async function (req: VercelRequest, res: VercelResponse): Promise<void> {
  try {
    const limit: any = req.query.limit ? req.query.limit : '5';
    return200(res, { updated_at: new Date().getTime(), data: {tvl: await getTransactions(parseInt(limit)) }});
  } catch (error) {
    return500(res, error);
  }
}