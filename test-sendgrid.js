import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";

dotenv.config();

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL;

console.log("\n=== SendGrid Configuration Test ===");
console.log("API Key:", SENDGRID_API_KEY ? `${SENDGRID_API_KEY.substring(0, 15)}...` : "❌ NOT SET");
console.log("From Email:", SENDGRID_FROM_EMAIL || "❌ NOT SET");
console.log();

if (!SENDGRID_API_KEY) {
  console.error("❌ ERROR: SENDGRID_API_KEY is not set in .env file");
  process.exit(1);
}

if (!SENDGRID_FROM_EMAIL) {
  console.error("❌ ERROR: SENDGRID_FROM_EMAIL is not set in .env file");
  process.exit(1);
}

sgMail.setApiKey(SENDGRID_API_KEY);

const testEmail = async () => {
  try {
    console.log("📧 Testing SendGrid connection...");
    console.log(`   Sending test email to: ${SENDGRID_FROM_EMAIL}`);
    console.log();

    const msg = {
      to: SENDGRID_FROM_EMAIL, // Send to yourself for testing
      from: SENDGRID_FROM_EMAIL,
      subject: "✅ SendGrid Test - Configuration Successful",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #4CAF50; border-radius: 8px;">
          <h2 style="text-align: center; color: #4CAF50;">✅ SendGrid is Working!</h2>
          <p>If you receive this email, your SendGrid configuration is correct.</p>
          <ul>
            <li><strong>API Key:</strong> Valid ✅</li>
            <li><strong>Sender Email:</strong> Verified ✅</li>
            <li><strong>Connection:</strong> Successful ✅</li>
          </ul>
          <p style="margin-top: 20px; padding: 15px; background-color: #f0f0f0; border-radius: 4px;">
            <strong>Next Step:</strong> Test your registration endpoint in Postman!
          </p>
        </div>
      `,
    };

    const response = await sgMail.send(msg);
    console.log("✅ SUCCESS! Email sent successfully!");
    console.log("📊 Response Status:", response[0].statusCode);
    console.log();
    console.log("🎉 SendGrid is working perfectly!");
    console.log("📬 Check your email:", SENDGRID_FROM_EMAIL);
    console.log();
    console.log("✅ Your configuration is correct. Now test your API endpoints in Postman.");

  } catch (error) {
    console.error("\n❌ FAILED to send email!");
    console.error("\n=== Error Details ===");

    if (error.response) {
      console.error("Status Code:", error.response.statusCode);
      console.error("Error Body:", JSON.stringify(error.response.body, null, 2));
      console.error();

      // Provide solutions for common errors
      if (error.response.statusCode === 401) {
        console.error("🔑 PROBLEM: Your API key is INVALID or EXPIRED");
        console.error();
        console.error("📋 SOLUTION:");
        console.error("   1. Go to: https://app.sendgrid.com/settings/api_keys");
        console.error("   2. Click 'Create API Key'");
        console.error("   3. Name it: 'Readian Backend'");
        console.error("   4. Choose 'Restricted Access'");
        console.error("   5. Enable: Mail Send → Full Access");
        console.error("   6. Click 'Create & View'");
        console.error("   7. COPY the API key (you only see it ONCE!)");
        console.error("   8. Update your .env file:");
        console.error("      SENDGRID_API_KEY=SG.your_new_key_here");
        console.error("   9. Restart your server");
        console.error();
      } else if (error.response.statusCode === 403) {
        console.error("📧 PROBLEM: Your sender email is NOT VERIFIED");
        console.error();
        console.error("📋 SOLUTION:");
        console.error("   1. Go to: https://app.sendgrid.com/settings/sender_auth");
        console.error("   2. Click 'Verify a Single Sender'");
        console.error("   3. Fill in the form:");
        console.error(`      - From Email: ${SENDGRID_FROM_EMAIL}`);
        console.error("      - From Name: Your Name or 'Readian'");
        console.error(`      - Reply To: ${SENDGRID_FROM_EMAIL}`);
        console.error("   4. Click 'Create'");
        console.error(`   5. Check your email (${SENDGRID_FROM_EMAIL})`);
        console.error("   6. Click the verification link from SendGrid");
        console.error("   7. Wait for 'Verified' status");
        console.error("   8. Try running this test again");
        console.error();
      } else if (error.response.statusCode === 429) {
        console.error("⏰ PROBLEM: Rate limit exceeded");
        console.error();
        console.error("📋 SOLUTION:");
        console.error("   Wait a few minutes and try again.");
        console.error();
      }
    } else {
      console.error("Error:", error.message);
    }

    process.exit(1);
  }
};

console.log("⚡ Starting SendGrid test...");
console.log();
testEmail();

