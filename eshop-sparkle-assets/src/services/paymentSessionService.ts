/**
 * E-Shop Payment Session Service
 * Creates payment sessions with Agentsphere backend for dynamic payments
 */

const AGENTSPHERE_API =
  import.meta.env.VITE_AGENTSPHERE_API_URL || "http://localhost:3001/api";
const USE_MOCK = import.meta.env.VITE_USE_MOCK_PAYMENT_SESSIONS === "true";

// Terminal Agent ID - In production, this would be configured per merchant
// For now, we use a placeholder that merchants would configure
const TERMINAL_AGENT_ID = "agent_terminal_eshop_001"; // This should be set by merchant

export const createPaymentSession = async (orderData) => {
  try {
    const {
      orderId,
      amount,
      currency = "USD",
      items,
      merchantName = "CubePay Merch",
      returnUrl,
    } = orderData;

    console.log("🛒 Creating payment session for e-shop order:", {
      orderId,
      amount,
      itemCount: items?.length,
    });

    // Mock mode for testing without backend
    if (USE_MOCK) {
      console.log("🧪 Using mock payment session creation");
      await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate API delay

      const sessionId = `ps_mock_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const mockSession = {
        id: sessionId,
        terminalAgentId: TERMINAL_AGENT_ID,
        merchantId: "eshop_cubepay_merch",
        merchantName,
        amount,
        currency,
        paymentMethod: "revolut_card",
        cartData: {
          items:
            items?.map((item) => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              image: item.image,
            })) || [],
          total: amount,
        },
        redirectUrl: returnUrl,
        status: "pending",
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 min
        metadata: {
          orderId,
          merchantType: "eshop",
        },
      };

      // Encode session data in URL (localStorage doesn't work cross-origin between ports)
      const encodedData = btoa(
        JSON.stringify({
          id: sessionId,
          merchantName,
          amount,
          currency,
          items: mockSession.cartData.items,
          redirectUrl: returnUrl,
          total: amount,
        })
      );

      return {
        success: true,
        session: {
          ...mockSession,
          paymentUrl: `http://localhost:5173/virtual-terminal?session=${sessionId}&data=${encodedData}`,
        },
      };
    }

    // Create payment session
    const response = await fetch(
      `${AGENTSPHERE_API}/payments/terminal/create-session`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          terminalAgentId: TERMINAL_AGENT_ID,
          merchantId: "eshop_cubepay_merch",
          merchantName,
          amount,
          currency,
          paymentMethod: "revolut_card", // Virtual card payment
          cartData: {
            items:
              items?.map((item) => ({
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                image: item.image,
                metadata: {
                  productId: item.productId,
                  color: item.color,
                  size: item.size,
                },
              })) || [],
            total: amount,
          },
          redirectUrl: returnUrl,
          metadata: {
            orderId,
            merchantType: "eshop",
            timestamp: new Date().toISOString(),
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to create payment session");
    }

    const data = await response.json();

    console.log("✅ Payment session created:", {
      sessionId: data.session.id,
      paymentUrl: data.session.paymentUrl,
    });

    return {
      success: true,
      session: data.session,
    };
  } catch (error) {
    console.error("❌ Failed to create payment session:", error);
    throw error;
  }
};
