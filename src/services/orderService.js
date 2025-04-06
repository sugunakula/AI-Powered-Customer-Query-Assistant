export const checkApiHealth = async () => {
  try {
    // Try to fetch products as a health check
    const response = await fetch('https://product-api-90xc.onrender.com/api/products');
    
    if (!response.ok) {
      return false;
    }
    
    await response.json();
    return true;
  } catch (error) {
    return false;
  }
};

export const fetchUserOrders = async () => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Add cache-busting timestamp to prevent caching
    const timestamp = new Date().getTime();
    
    // Fetch orders
    const ordersResponse = await fetch(`https://product-api-90xc.onrender.com/api/orders?t=${timestamp}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
    
    if (!ordersResponse.ok) {
      if (ordersResponse.status === 401) {
        throw new Error('Authentication token expired or invalid');
      }
      let errorMessage = 'Failed to fetch orders';
      try {
        const errorData = await ordersResponse.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // Ignore parsing error
      }
      throw new Error(errorMessage);
    }
    
    // Parse the orders response as JSON and clear any previous cached orders
    let ordersData;
    try {
      ordersData = await ordersResponse.json();
      console.log('Fresh orders fetched:', ordersData);
    } catch (e) {
      throw new Error('Invalid response format from server');
    }
    
    // Fetch products for order details
    const productsResponse = await fetch(`https://product-api-90xc.onrender.com/api/products?t=${timestamp}`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    });
    if (!productsResponse.ok) {
      throw new Error('Failed to fetch products');
    }
    
    let productsData;
    try {
      productsData = await productsResponse.json();
    } catch (e) {
      throw new Error('Invalid response format from server');
    }

    // Create a map of products for easy lookup
    const productsMap = {};
    productsData.forEach(product => {
      productsMap[product._id] = {
        id: product._id,
        name: product.name,
        price: product.price,
        category: product.category,
        description: product.description,
        stock: product.stock
      };
    });

    // Format the orders data and include product details
    return ordersData.map(order => ({
      id: order._id,
      status: order.status,
      total_price: order.total_price,
      order_date: new Date(order.order_date).toLocaleDateString(),
      products: order.products.map(product => {
        const productDetails = productsMap[product.product_id];
        return {
          id: product.product_id,
          quantity: product.quantity,
          name: productDetails?.name || 'Product Not Found',
          price: productDetails?.price || 0,
          category: productDetails?.category || 'Unknown',
          description: productDetails?.description || ''
        };
      })
    }));
  } catch (error) {
    throw error;
  }
};

export const returnOrder = async (orderId, reason) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`https://product-api-90xc.onrender.com/api/orders/${orderId}/return`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        reason,
        order_id: orderId
      })
    });
    if (!response.ok) {
      throw new Error('Failed to process return');
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const createOrder = async (products, shippingAddress = '') => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Extract user ID from token
    let userId;
    try {
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        throw new Error('Invalid token format');
      }
      
      const tokenPayload = JSON.parse(atob(tokenParts[1]));
      userId = tokenPayload.id || tokenPayload.userId || tokenPayload.sub;
      
      if (!userId) {
        throw new Error('Token does not contain user ID');
      }
    } catch (e) {
      throw new Error('Invalid authentication token');
    }

    // Calculate total price
    const total_price = products.reduce((total, product) => 
      total + (product.price * product.quantity), 0
    );

    // Format products to match the MongoDB schema exactly
    const formattedProducts = products.map(product => ({
      product_id: product.id, // This should be a valid MongoDB ObjectId
      quantity: parseInt(product.quantity),
      price: product.price
    }));

    // Create order payload that matches the MongoDB schema exactly
    const requestPayload = {
      products: formattedProducts,
      total_price: total_price,
      status: 'Pending', // Using the exact enum value from the schema
      order_date: new Date().toISOString(),
      user_id: userId
    };

    // Log the request payload for debugging
    console.log('Sending order payload:', JSON.stringify(requestPayload, null, 2));

    // Create order
    const response = await fetch('https://product-api-90xc.onrender.com/api/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestPayload)
    });
    
    if (!response.ok) {
      let errorMessage = 'Failed to create order';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
        console.error('Order creation error:', errorData);
      } catch (e) {
        // Ignore parsing error
      }
      throw new Error(errorMessage);
    }

    // Parse the response as JSON
    let newOrder;
    try {
      newOrder = await response.json();
      console.log('Order created successfully:', newOrder);
    } catch (e) {
      throw new Error('Invalid response format from server');
    }
    
    return newOrder;
  } catch (error) {
    throw error;
  }
};

export const updateOrderStatus = async (orderId, status) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Validate status against allowed enum values
    const validStatuses = ['Pending', 'Shipped', 'Delivered'];
    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const response = await fetch(`https://product-api-90xc.onrender.com/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      let errorMessage = 'Failed to update order status';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
        console.error('Status update error:', errorData);
      } catch (e) {
        // Ignore parsing error
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const updateOrderItems = async (orderId, products) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Use the status update endpoint since that's what's available in your API
    const response = await fetch(`https://product-api-90xc.onrender.com/api/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ 
        status: 'Pending', // Using the exact enum value from the schema
        products: products
      })
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Order not found');
      }
      let errorMessage = 'Failed to update order items';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
        console.error('Order update error:', errorData);
      } catch (e) {
        // Ignore parsing error
      }
      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const deleteOrder = async (orderId) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`https://product-api-90xc.onrender.com/api/orders/${orderId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to delete order');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

// Admin-specific functions
export const fetchAllOrders = async () => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch('https://product-api-90xc.onrender.com/api/orders/admin/all', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Authentication token expired or invalid');
      }
      throw new Error('Failed to fetch orders');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const updateOrderAdmin = async (orderId, updateData) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`https://product-api-90xc.onrender.com/api/orders/admin/${orderId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updateData)
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Order not found');
      }
      throw new Error('Failed to update order');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
};

export const deleteOrderAdmin = async (orderId) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(`https://product-api-90xc.onrender.com/api/orders/admin/${orderId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Order not found');
      }
      throw new Error('Failed to delete order');
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}; 