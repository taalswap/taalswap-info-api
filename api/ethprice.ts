import { VercelRequest, VercelResponse } from "@vercel/node";
import { return200, return500 } from "../utils/response";
import { getEthPrice } from "../utils";

export default async function (req: VercelRequest, res: VercelResponse): Promise<void> {
  try {
    return200(res, { updated_at: new Date().getTime(), data: {ethPrice: await getEthPrice() }});
  } catch (error) {
    return500(res, error);
  }
}