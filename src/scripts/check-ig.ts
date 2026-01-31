import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const IG_TOKEN = process.env.IG_TOKEN;
const IG_USER_ID = process.env.IG_USER_ID;

async function checkToken() {
    if (!IG_TOKEN || !IG_USER_ID) {
        console.error("❌ Missing IG_TOKEN or IG_USER_ID in .env");
        return;
    }

    console.log("🔍 Checking Instagram Token status...");
    console.log(`Token: ${IG_TOKEN.substring(0, 10)}...${IG_TOKEN.substring(IG_TOKEN.length - 5)}`);

    try {
        const response = await axios.get(`https://graph.facebook.com/v24.0/me`, {
            params: {
                fields: "id,name",
                access_token: IG_TOKEN,
            },
        });

        console.log("✅ Token is VALID!");
        console.log("User Info:", response.data);

        // Check Business Account
        console.log(`\n🔍 Checking Business Account ID: ${IG_USER_ID}...`);
        const bizResponse = await axios.get(`https://graph.facebook.com/v24.0/${IG_USER_ID}`, {
            params: {
                fields: "id,username,name",
                access_token: IG_TOKEN,
            },
        });
        console.log("✅ Business Account found:", bizResponse.data);

    } catch (error: unknown) {
        console.error("❌ Token Validation Failed!");
        const err = error as { response?: { data?: { error?: { error_subcode?: number } } }; message?: string };

        if (err.response) {
            console.error(JSON.stringify(err.response.data, null, 2));
            const subcode = err.response.data?.error?.error_subcode;
            if (subcode === 467) {
                console.error("\n💡 HINT: Error subcode 467 means the user has logged out or changed their password.");
                console.error("You need to generate a NEW Long-Lived Token from the Meta for Developers portal.");
            } else if (subcode === 463) {
                console.error("\n💡 HINT: Token has expired.");
            }
        } else {
            console.error(err.message || "Unknown error occurred");
        }
    }
}

checkToken();
