import { supabase } from "@/integrations/supabase/client";

interface PriceFeedResponse {
  ethPrice: number;
  adminFeeUSDC: number;
  adminFeeETH: string;
  adminFeeWei: string;
  timestamp: string;
  fallback?: boolean;
}

let cachedPrice: PriceFeedResponse | null = null;
let cacheTime = 0;
const CACHE_DURATION_MS = 60_000; // 1 minute

export async function getEthPrice(): Promise<PriceFeedResponse> {
  // Return cached if fresh
  if (cachedPrice && Date.now() - cacheTime < CACHE_DURATION_MS) {
    return cachedPrice;
  }

  try {
    const { data, error } = await supabase.functions.invoke("eth-price");
    if (error) throw error;

    cachedPrice = data as PriceFeedResponse;
    cacheTime = Date.now();
    return cachedPrice;
  } catch {
    // Fallback if edge function fails
    const fallbackPrice = 3800;
    const feeEth = 0.12 / fallbackPrice;
    return {
      ethPrice: fallbackPrice,
      adminFeeUSDC: 0.12,
      adminFeeETH: feeEth.toFixed(18),
      adminFeeWei: Math.ceil(feeEth * 1e18).toString(),
      timestamp: new Date().toISOString(),
      fallback: true,
    };
  }
}

export function formatMicroFee(ethPrice: number): string {
  const feeEth = 0.12 / ethPrice;
  if (feeEth < 0.0001) return `< 0.0001 ETH`;
  return `~${feeEth.toFixed(6)} ETH`;
}
