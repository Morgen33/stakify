import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Fetch ETH/USD price from CoinGecko (free, no API key needed)
    const res = await fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd",
      { headers: { Accept: "application/json" } }
    );

    if (!res.ok) {
      throw new Error(`CoinGecko API error: ${res.status}`);
    }

    const data = await res.json();
    const ethPrice = data.ethereum?.usd;

    if (!ethPrice) {
      throw new Error("Could not fetch ETH price");
    }

    // Calculate $0.12 USDC equivalent in ETH
    const ADMIN_FEE_USDC = 0.12;
    const feeInEth = ADMIN_FEE_USDC / ethPrice;

    // Convert to wei (18 decimals)
    const feeInWei = Math.ceil(feeInEth * 1e18).toString();

    return new Response(
      JSON.stringify({
        ethPrice: ethPrice,
        adminFeeUSDC: ADMIN_FEE_USDC,
        adminFeeETH: feeInEth.toFixed(18),
        adminFeeWei: feeInWei,
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message,
        // Fallback: assume ETH ~$3800
        fallback: true,
        ethPrice: 3800,
        adminFeeUSDC: 0.12,
        adminFeeETH: (0.12 / 3800).toFixed(18),
        adminFeeWei: Math.ceil((0.12 / 3800) * 1e18).toString(),
        timestamp: new Date().toISOString(),
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200, // Return 200 with fallback so frontend doesn't break
      }
    );
  }
});
