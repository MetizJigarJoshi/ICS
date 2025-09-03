// Webhook utility functions for sending data to external services

interface WebhookPayload {
  user_id: string;
  email: string;
  full_name: string;
  form_data?: any;
  event_type: "signup" | "eligibility_form" | "form_completion";
  timestamp: string;
}

export const sendWebhook = async (
  payload: WebhookPayload
): Promise<boolean> => {
  try {
    console.log("🚀 Starting webhook call to n8n...");
    console.log("📤 Webhook payload:", payload);
    console.log(
      "🌐 Webhook URL: https://n8n.metizsoft.in/webhook/candidate-form"
    );

    // Test if the URL is reachable first
    try {
      console.log("🔍 Testing if webhook URL is reachable...");
      const testResponse = await fetch(
        "https://n8n.metizsoft.in/webhook/candidate-form",
        {
          method: "OPTIONS",
        }
      );
      console.log("🔍 OPTIONS test response:", testResponse.status);
    } catch (testError) {
      console.warn("⚠️ OPTIONS test failed:", testError);
    }

    const response = await fetch(
      "https://n8n.metizsoft.in/webhook/candidate-form",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      }
    );

    console.log("📡 Response status:", response.status);
    console.log("📡 Response headers:", response.headers);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Webhook failed with status:", response.status);
      console.error("❌ Error response:", errorText);
      throw new Error(
        `Webhook failed with status: ${response.status}: ${errorText}`
      );
    }

    const result = await response.json();
    console.log("✅ Webhook sent successfully:", result);
    return true;
  } catch (error) {
    console.error("💥 Failed to send webhook:", error);
    console.error("💥 Error details:", {
      name: error instanceof Error ? error.name : "Unknown",
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : "No stack trace",
    });
    return false;
  }
};

export const sendSignupWebhook = async (
  userId: string,
  email: string,
  fullName: string,
  formData?: any
): Promise<boolean> => {
  const payload: WebhookPayload = {
    user_id: userId,
    email: email,
    full_name: fullName,
    form_data: formData || null,
    event_type: "signup",
    timestamp: new Date().toISOString(),
  };

  return sendWebhook(payload);
};

export const sendEligibilityFormWebhook = async (
  userId: string,
  email: string,
  fullName: string,
  formData: any
): Promise<boolean> => {
  const payload: WebhookPayload = {
    user_id: userId,
    email: email,
    full_name: fullName,
    form_data: formData,
    event_type: "eligibility_form",
    timestamp: new Date().toISOString(),
  };

  return sendWebhook(payload);
};

export const sendFormCompletionWebhook = async (
  userId: string,
  email: string,
  fullName: string,
  formData: any
): Promise<boolean> => {
  const payload: WebhookPayload = {
    user_id: userId,
    email: email,
    full_name: fullName,
    form_data: formData,
    event_type: "form_completion",
    timestamp: new Date().toISOString(),
  };

  return sendWebhook(payload);
};
