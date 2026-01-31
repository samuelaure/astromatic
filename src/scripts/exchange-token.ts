import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

/**
 * Utility to exchange a SHORT-LIVED token for a LONG-LIVED token (60 days).
 * Usage: npx tsx src/scripts/exchange-token.ts <short_lived_token> <app_id> <app_secret>
 */

const [, , shortToken, appId, appSecret] = process.argv;

async function exchangeToken() {
    if (!shortToken || !appId || !appSecret) {
        console.log("\n🚀 Astromatic: Instagram Token Exchange Tool");
        console.log("Usage: npx tsx src/scripts/exchange-token.ts <short_lived_token> <app_id> <app_secret>\n");
        console.log("1. Go to Graph API Explorer (https://developers.facebook.com/tools/explorer/)");
        console.log("2. Select your App and Get User Access Token with 'instagram_basic', 'instagram_content_publish', 'pages_show_list', 'pages_read_engagement'.");
        console.log("3. Copy the 'Short-Lived' token and run this script.");
        return;
    }

    try {
        console.log("📡 Exchanging token...");
        const response = await axios.get(`https://graph.facebook.com/v24.0/oauth/access_token`, {
            params: {
                grant_type: "fb_exchange_token",
                client_id: appId,
                client_secret: appSecret,
                fb_exchange_token: shortToken,
            },
        });

        const { access_token, expires_in } = response.data;
        console.log("\n✅ SUCCESS! New Long-Lived Token:");
        console.log("--------------------------------------------------");
        console.log(access_token);
        console.log("--------------------------------------------------");
        console.log(`Expires in: ${Math.round(expires_in / 86400)} days`);
        console.log("\n👉 ACTION: Copy this token into your .env as IG_TOKEN");

    } catch (error: unknown) {
        console.error("❌ Exchange Failed!");
        const err = error as { response?: { data?: unknown }; message?: string };
        console.error(err.response?.data || err.message || "Unknown error");
    }
}

exchangeToken();
