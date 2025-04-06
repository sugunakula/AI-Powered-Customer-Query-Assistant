// Define valid condition enum values to match MongoDB schema
const REFUND_CONDITIONS = {
  UNOPENED: 'Unopened',
  DEFECTIVE: 'Defective',
  WRONG_ITEM: 'Wrong Item',
  OTHER: 'Other'
};

export const createRefund = async (orderId, reason, condition = 'Unopened') => {
  try {
    const token = localStorage.getItem('token');
    // Get userId from JWT token
    const tokenData = JSON.parse(atob(token.split('.')[1]));
    const userId = tokenData.id;
    
    // Store userId for later use
    localStorage.setItem('userId', userId);

    if (!token) {
      throw new Error('No authentication token found');
    }

    // Validate orderId format - MongoDB ObjectId is a 24-character hex string
    if (!orderId || typeof orderId !== 'string' || !/^[0-9a-fA-F]{24}$/.test(orderId)) {
      throw new Error('Invalid order ID format. Please provide a valid order ID.');
    }

    // First, check if the order is delivered before allowing a refund
    try {
      const { fetchUserOrders } = await import('./orderService');
      const userOrders = await fetchUserOrders();
      
      // Find the order
      const order = userOrders.find(order => order.id === orderId || order._id === orderId);
      
      if (!order) {
        throw new Error('Order not found. Please check the order ID and try again.');
      }
      
      // Check if order status is "Delivered" - case insensitive check
      const orderStatus = (order.status || '').toLowerCase();
      if (orderStatus !== 'delivered') {
        throw new Error(`Cannot process refund - order is not delivered yet. Current status: ${order.status}. Refunds are only available for delivered orders.`);
      }
      
      console.log(`Order status verified: ${order.status}, processing refund...`);
    } catch (err) {
      if (err.message.includes('Cannot process refund')) {
        throw err; // Rethrow the specific error
      }
      // If there's another error in fetching orders, proceed with caution
      console.error('Error verifying order status:', err);
    }

    // Map user input to valid enum values
    const conditionMap = {
      'unopened': REFUND_CONDITIONS.UNOPENED,
      'defective': REFUND_CONDITIONS.DEFECTIVE,
      'wrong item': REFUND_CONDITIONS.WRONG_ITEM,
      'other': REFUND_CONDITIONS.OTHER
    };

    // Get the correct condition value
    const normalizedCondition = conditionMap[condition.toLowerCase()] || REFUND_CONDITIONS.OTHER;

    const response = await fetch('https://product-api-90xc.onrender.com/api/refunds', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        order_id: orderId,
        user_id: userId,
        reason: reason,
        condition: normalizedCondition,
        status: 'Pending'
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to create refund request');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    throw error;
  }
};

export const getRefundStatus = async (refundId) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Add cache busting
    const timestamp = new Date().getTime();
    
    const response = await fetch(`https://product-api-90xc.onrender.com/api/refunds/${refundId}?t=${timestamp}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });

    if (response.status === 404) {
      return null;
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch refund status');
    }

    const refund = await response.json();
    return refund;
  } catch (error) {
    throw error;
  }
};

// Helper function to store refund ID after creation
export const storeRefundId = (refundId) => {
  const refundIds = JSON.parse(localStorage.getItem('refundIds') || '[]');
  if (!refundIds.includes(refundId)) {
    refundIds.push(refundId);
    localStorage.setItem('refundIds', JSON.stringify(refundIds));
  }
};

// Helper function to get all user's refund IDs
export const getUserRefundIds = () => {
  return JSON.parse(localStorage.getItem('refundIds') || '[]');
};

// Function to get all user's refunds directly from API by user ID
export const getAllUserRefunds = async () => {
  try {
    const token = localStorage.getItem('token');
    let userId = localStorage.getItem('userId');
    
    if (!token) {
      throw new Error('No authentication token found');
    }
    
    // Add cache busting timestamp
    const timestamp = new Date().getTime();
    console.log("Fetching fresh refund data...");
    
    // Always try to extract userId from token for verification
    try {
      const tokenParts = token.split('.');
      
      if (tokenParts.length === 3) {
        const tokenData = JSON.parse(atob(tokenParts[1]));
        
        // Check all possible userId fields
        const possibleIds = {
          id: tokenData.id,
          _id: tokenData._id,
          userId: tokenData.userId,
          sub: tokenData.sub,
          user: tokenData.user
        };
        
        // Use the token's user ID if available and localStorage doesn't have one
        if (!userId) {
          userId = tokenData.id || tokenData._id || tokenData.userId || tokenData.sub || 
                  (tokenData.user && (tokenData.user.id || tokenData.user._id));
          
          if (userId) {
            localStorage.setItem('userId', userId);
          }
        }
      }
    } catch (tokenError) {
      // Ignore token parsing errors
    }
    
    // Try to get the user's orders and create mock refund objects
    let userRefunds = [];
    
    // First, check any stored refund IDs and fetch them individually
    const refundIds = getUserRefundIds();
    
    if (refundIds.length > 0) {
      console.log("Fetching refunds from stored refund IDs...");
      const refundPromises = refundIds.map(id => getRefundStatus(id));
      const results = await Promise.all(
        refundPromises.map(p => p.catch(e => {
          console.error("Error fetching individual refund:", e);
          return null;
        }))
      );
      
      const validRefunds = results.filter(refund => refund !== null);
      
      if (validRefunds.length > 0) {
        userRefunds = [...validRefunds];
        console.log("Valid refunds fetched:", validRefunds.length);
        
        // Update localStorage with valid refund IDs
        const validRefundIds = validRefunds.map(refund => refund._id);
        localStorage.setItem('refundIds', JSON.stringify(validRefundIds));
      }
    }
    
    // Next, try to get the user's orders to find orders with refund status
    try {
      console.log("Fetching refund-related orders...");
      const { fetchUserOrders } = await import('./orderService');
      const userOrders = await fetchUserOrders();
      
      if (userOrders && userOrders.length > 0) {
        console.log("Total orders found:", userOrders.length);
        // Create mock refund objects from orders with refund-related status
        const orderRefunds = userOrders
          .filter(order => 
            order.status?.toLowerCase().includes('refund') || 
            order.status?.toLowerCase().includes('return')
          )
          .map(order => ({
            _id: order._id + '_refund', // Create pseudo-refund ID
            order_id: order._id,
            user_id: userId,
            reason: order.status || 'Return requested',
            condition: 'Unknown',
            status: order.status?.toLowerCase().includes('approved') ? 'Approved' : 
                    order.status?.toLowerCase().includes('rejected') ? 'Rejected' : 'Pending',
            createdAt: order.order_date || new Date().toISOString()
          }));
          
        if (orderRefunds.length > 0) {
          console.log("Refund-related orders found:", orderRefunds.length);
          // Add order-based refunds and remove duplicates
          userRefunds = [
            ...userRefunds,
            ...orderRefunds.filter(or => !userRefunds.some(ur => ur.order_id === or.order_id))
          ];
        }
      }
    } catch (orderError) {
      console.error("Error fetching refund-related orders:", orderError);
      // Ignore order fetching errors
    }
    
    console.log("Total refunds data fetched:", userRefunds.length);
    return userRefunds;
  } catch (error) {
    console.error("Error in getAllUserRefunds:", error);
    return []; // Return empty array instead of throwing to prevent UI breakage
  }
};

// Update the cancelRefund function to match the backend response
export const cancelRefund = async (refundId) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`https://product-api-90xc.onrender.com/api/refunds/${refundId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.status === 404) {
      throw new Error('Refund request not found');
    }

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to cancel refund request');
    }

    // Only remove from localStorage if deletion was successful
    const refundIds = JSON.parse(localStorage.getItem('refundIds') || '[]');
    const updatedRefundIds = refundIds.filter(id => id !== refundId);
    localStorage.setItem('refundIds', JSON.stringify(updatedRefundIds));

    const result = await response.json();

    return { 
      success: true, 
      message: result.message || 'Refund cancelled successfully' 
    };
  } catch (error) {
    throw error;
  }
};

// Admin functions for refunds
export const getAllRefunds = async () => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch('https://product-api-90xc.onrender.com/api/refunds', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication token expired or invalid');
      }
      throw new Error('Failed to fetch refunds');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const updateRefundStatus = async (refundId, status) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`https://product-api-90xc.onrender.com/api/refunds/${refundId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Refund not found');
      }
      throw new Error('Failed to update refund status');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}; 