const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Helper function to extract order ID from message
const extractOrderId = (message) => {
  // Try to extract ID after # symbol
  if (message.includes('#')) {
    const afterHash = message.split('#')[1].trim();
    const orderId = afterHash.split(/\s+|[,.;]/)[0];
    return orderId;
  }
  
  // Try to find MongoDB ObjectId pattern (24 hex chars)
  const objectIdMatch = message.match(/\b([0-9a-f]{24})\b/i);
  if (objectIdMatch) {
    return objectIdMatch[1];
  }
  
  // Try to find "order" followed by ID
  const orderIdMatch = message.match(/order\s+(?:id|number|#)?\s*[:#]?\s*(\w+)/i);
  if (orderIdMatch) {
    return orderIdMatch[1];
  }
  
  return null;
};

export const generateAIResponse = async (message, products, orders) => {
  try {
    // Get the API key from environment variable
    const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
    
    if (!apiKey) {
      console.error('OpenAI API key not found in environment variables');
      throw new Error('API key configuration error. Please contact support.');
    }

    // Create knowledge base strings
    const productKnowledge = products.map(p => 
      `Product: ${p.name}
       ID: ${p._id}
       Price: $${p.price}
       Category: ${p.category}
       Description: ${p.description}
       Stock: ${p.stock}`
    ).join('\n\n');

    const orderKnowledge = orders.map(o => 
      `Order ID: ${o.id || o._id}
       Status: ${o.status}
       Total Price: $${o.total_price || o.totalPrice || 0}
       Order Date: ${o.order_date ? new Date(o.order_date).toLocaleDateString() : o.created_at ? new Date(o.created_at).toLocaleDateString() : o.createdAt ? new Date(o.createdAt).toLocaleDateString() : 'Not specified'}
       Products: ${o.products ? o.products.map(p => 
         `${p.quantity}x ${p.name} ($${p.price} each) - ${p.description || ''}`
       ).join(', ') : 'No product details available'}`
    ).join('\n\n');

    // Store conversation history in localStorage
    const conversationHistory = JSON.parse(localStorage.getItem('chatHistory') || '[]');
    
    // Add user's message to history
    conversationHistory.push({ role: 'user', content: message });

    // Keep only last 10 messages for context
    const recentHistory = conversationHistory.slice(-10);

    // Check if message is about refunds
    const isRefundRequest = message.toLowerCase().includes('refund') || 
                           message.toLowerCase().includes('money back');
                           
    // Check if message is specifically about creating a new refund
    const isCreateRefundRequest = (message.toLowerCase().includes('want to refund') || 
                                message.toLowerCase().includes('request refund') ||
                                message.toLowerCase().includes('get a refund for') ||
                                message.toLowerCase().includes('refund this order') ||
                                (message.toLowerCase() === 'refund' && recentHistory.length > 0)) &&
                                (message.includes('#') || message.match(/\b([0-9a-f]{24})\b/i) || 
                                 // Check if this is part of a multi-turn refund conversation
                                 (recentHistory.length > 0 && 
                                  recentHistory[recentHistory.length-2]?.role === 'assistant' && 
                                  recentHistory[recentHistory.length-2]?.content.includes('provide the reason for the refund')));
                                
    // Check if message is about checking refund status only
    const isRefundStatusRequest = (message.toLowerCase().includes('refund status') || 
                                message.toLowerCase().includes('check refund') ||
                                message.toLowerCase().includes('my refunds')) &&
                                !isCreateRefundRequest;

    // Check if message is requesting product list
    const isProductListRequest = message.toLowerCase().includes('show products') || 
                              message.toLowerCase().includes('list products') ||
                              message.toLowerCase().includes('what products') ||
                              message.toLowerCase().includes('show me the products') ||
                              message.toLowerCase().includes('product catalog') ||
                              message.toLowerCase().includes('available products');
                              
    // Check if message is requesting order history
    const isOrderHistoryRequest = message.toLowerCase().includes('show orders') || 
                               message.toLowerCase().includes('list orders') ||
                               message.toLowerCase().includes('my orders') ||
                               message.toLowerCase().includes('order history') ||
                               message.toLowerCase().includes('show my orders') ||
                               message.toLowerCase().includes('view orders');
                               
    // Check if message is requesting to cancel an order (not a refund)
    const isOrderCancellationRequest = (message.toLowerCase().includes('cancel') || 
                                    message.toLowerCase().includes('delete')) && 
                                    message.toLowerCase().includes('order') &&
                                    !message.toLowerCase().includes('refund');

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a helpful customer service assistant. 
            Here is our product catalog:\n${productKnowledge}\n
            Current user orders:\n${orderKnowledge}\n
            You can help users track orders, process refunds, and create new orders.
            
            When users ask to see products or show the product catalog:
            1. Display ALL products in a clear, structured format
            2. Format each product with Name, Price, Category, Description, and Stock on separate lines
            3. Add a visual separator between products (like dashes or asterisks)
            4. Group products by category if possible
            5. Use markdown formatting for better readability (bold for names, etc.)
            
            Example product list format:
            
            **Product Name 1**
            Price: $XX.XX
            Category: Electronics
            Description: This is a description of the product
            In Stock: XX units
            --------------------------
            **Product Name 2**
            Price: $XX.XX
            Category: Electronics 
            Description: This is a description of the product
            In Stock: XX units
            --------------------------
            
            When users ask to see their orders or order history:
            1. Display ALL orders in a clear, structured format
            2. Format each order with Order ID, Status, Total Price, Order Date, and Products on separate lines
            3. Add a visual separator between orders (like dashes or asterisks)
            4. Use markdown formatting for better readability (bold for order IDs, etc.)
            5. Include special command [GET_ORDER_STATUS] so the client can fetch fresh order data
            
            Example order list format:
            
            [GET_ORDER_STATUS]
            **Order #123456**
            Status: Shipped
            Total Price: $XX.XX
            Order Date: MM/DD/YYYY
            Products:
            - 2x Product Name ($XX each)
            - 1x Product Name ($XX each)
            --------------------------
            
            When a user wants to place an order:
            1. Ask for the product they want to order
            2. Ask for the quantity they want
            3. Include order command in your response like this: [ORDER_PRODUCT:{product_id}:{quantity}]
            Example: "I'll place an order for 2 units of Product Name [ORDER_PRODUCT:65f1a2b3c4d5e6f7g8h9i0j1:2]"
            
            When a user wants to cancel an order:
            1. Extract the order ID from their message if provided
            2. Include delete order command in your response like this: [DELETE_ORDER:{order_id}]
            3. DO NOT show refund status when cancelling an order
            Example: "I'll cancel your order #123 [DELETE_ORDER:123]"
            
            When a user asks about refunds or mentions "my refunds":
            1. Immediately respond with [GET_REFUND_STATUS] to show their refund history
            2. Include the refund ID in the response for reference
            Example: "Here are your refund requests:
            Refund ID: 67b2d6d0bbf213bb392143b1
            Order #123
            Status: Pending
            ..."
            
            When a user wants to request a new refund:
            1. If the user provides an order ID, do NOT show the refund status first - proceed directly with creating the refund
            2. Ask for BOTH the reason for the refund AND the product condition in the same message
            3. The condition must be one of: Unopened, Defective, Wrong Item, Other
            4. After the user provides the reason/condition, IMMEDIATELY include the refund command: [REFUND_ORDER:{order_id}:{reason}:{condition}]
            5. Do NOT show refund status when processing a new refund
            6. IMPORTANT: Refunds can only be processed for orders that have been delivered
            7. In your refund confirmation message, NEVER mention "refunds are only available for delivered orders" when the refund is successfully processed
            
            Examples of GOOD refund confirmation messages:
            "I'll process the refund for order #123 due to the product being defective. [REFUND_ORDER:123:Defective product:Defective]"
            "Your refund request has been submitted for order #456. [REFUND_ORDER:456:Wrong size:Unopened]"
            "I've processed your refund request for the mismatch issue. [REFUND_ORDER:789:Product mismatch:Unopened]"
            
            Examples of BAD refund confirmation messages (DO NOT USE):
            "I'll process your refund. Please note that refunds are only available for delivered orders. [REFUND_ORDER:123:Defective product:Defective]"
            "I've submitted your refund request. Remember that you can only request refunds for delivered orders. [REFUND_ORDER:456:Wrong size:Unopened]"
            
            If the user provides one-word response like "Defective" or "Wrong Item" after you asked for reason/condition:
            - Use that as the condition
            - Use a generic reason like "Item not satisfactory" 
            - Complete the refund immediately: [REFUND_ORDER:{order_id}:Item not satisfactory:{user's one-word response}]
            
            Note: If the user wants to refund an order that is still pending or shipping, explain that refunds are 
            only available for delivered orders. They should wait until the order is delivered before requesting a refund.
            
            When a user wants to check existing refunds status (without creating a new one):
            1. Respond with [GET_REFUND_STATUS] to show the user's refund history
            2. Do NOT ask for reason or condition when just checking status
            
            When a user wants to cancel a refund:
            1. Make sure to use the Refund ID (starts with "Refund ID:") from the refund status, NOT the Order ID
            2. Include cancel command in your response like this: [CANCEL_REFUND:{refund_id}]
            Example: If user says "cancel refund for order #123", first show refund status to get the Refund ID, then use that ID for cancellation.
            
            IMPORTANT: Always use the Refund ID (not Order ID) for cancellation. The Refund ID is different from the Order ID.
            If user tries to cancel using Order ID, explain that you need the Refund ID and show their refund status first.
            
            Example conversation:
            User: "Cancel refund for order #123"
            Assistant: "Let me find the Refund ID for that order [GET_REFUND_STATUS]"
            (after seeing Refund ID)
            Assistant: "I'll cancel your refund request [CANCEL_REFUND:67b2d6d0bbf213bb392143b1]"
            
            Example order conversation:
            User: "I want to order a laptop"
            Assistant: "I'd be happy to help you order a laptop. How many would you like to order?"
            User: "I want 2 laptops"
            Assistant: "Great! I'll place an order for 2 laptops [ORDER_PRODUCT:65f1a2b3c4d5e6f7g8h9i0j1:2]"
            `
          },
          ...recentHistory,
          {
            role: "user",
            content: isRefundStatusRequest ? 
              `User wants to check refund status only. Show existing refund requests with [GET_REFUND_STATUS]` : 
              isCreateRefundRequest ?
              `User wants to create a new refund for order ${extractOrderId(message) || "from recent conversation"}. ${
                // Check if this might be just a condition response like "Defective"
                message.length < 20 && !message.includes('#') && !message.includes("refund") ? 
                `User provided condition: "${message}". Use this as the condition, use "Item not satisfactory" as the reason, and create the refund immediately with the REFUND_ORDER command.` :
                `Ask for the reason and condition for this specific order if not provided.`
              }` :
              isProductListRequest ?
              `User wants to see all available products in the catalog. Please list all products in a structured format as described.` :
              isOrderHistoryRequest ?
              `User wants to see all available orders. Start your response with [GET_ORDER_STATUS] and then list all orders in a structured format as described.` :
              isOrderCancellationRequest ?
              `User wants to cancel an order. ${extractOrderId(message) ? 'Order ID: ' + extractOrderId(message) + '. Use DELETE_ORDER command.' : 'Please ask user for the order ID.'}` :
              message
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    if (!response.ok) {
      throw new Error('Failed to generate AI response');
    }

    const data = await response.json();
    
    // Add AI's response to history
    conversationHistory.push({ 
      role: 'assistant', 
      content: data.choices[0].message.content 
    });
    
    // Save updated history
    localStorage.setItem('chatHistory', JSON.stringify(conversationHistory));

    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating AI response:', error);
    throw error;
  }
};