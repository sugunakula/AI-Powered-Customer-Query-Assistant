import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { generateAIResponse } from '../services/openaiService';
import { fetchProducts } from '../services/productService';
import { 
  fetchUserOrders, 
  returnOrder, 
  createOrder, 
  updateOrderItems, 
  deleteOrder, 
  fetchAllOrders, 
  updateOrderAdmin, 
  deleteOrderAdmin,
  checkApiHealth
} from '../services/orderService';
import { createRefund, getRefundStatus, storeRefundId, getUserRefundIds, getAllUserRefunds, cancelRefund } from '../services/refundService';
import { 
  Send, 
  AttachFile, 
  EmojiEmotions, 
  ExitToApp, 
  MenuOpen,
  Brightness4,
  Brightness7,
  History,
  Info,
  Help
} from '@mui/icons-material';
import '../styles/ChatInterface.css';

// AI Assistant Illustration
const AIAssistantIllustration = () => (
  <svg
    className="chat-ai-assistant"
    width="200"
    height="200"
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Gradients */}
    <defs>
      <radialGradient
        id="gradientOuter"
        cx="0"
        cy="0"
        r="1"
        gradientUnits="userSpaceOnUse"
        gradientTransform="translate(100 100) rotate(90) scale(100)"
      >
        <stop offset="0%" stopColor="#3B82F6" />
        <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
      </radialGradient>
      <linearGradient
        id="gradientMiddle"
        x1="50"
        y1="100"
        x2="150"
        y2="100"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#3B82F6" />
        <stop offset="1" stopColor="#8B5CF6" />
      </linearGradient>
      <linearGradient
        id="gradientInner"
        x1="70"
        y1="100"
        x2="130"
        y2="100"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#3B82F6" />
        <stop offset="1" stopColor="#8B5CF6" />
      </linearGradient>
      <linearGradient
        id="faceGradient"
        x1="80"
        y1="80"
        x2="120"
        y2="80"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#3B82F6" />
        <stop offset="1" stopColor="#8B5CF6" />
      </linearGradient>
      <linearGradient
        id="antennaGradient"
        x1="100"
        y1="55"
        x2="100"
        y2="40"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#3B82F6" />
        <stop offset="1" stopColor="#8B5CF6" />
      </linearGradient>
      <linearGradient
        id="dotGradient1"
        x1="135"
        y1="100"
        x2="145"
        y2="100"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#3B82F6" />
        <stop offset="1" stopColor="#8B5CF6" />
      </linearGradient>
      <linearGradient
        id="dotGradient2"
        x1="55"
        y1="100"
        x2="65"
        y2="100"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#3B82F6" />
        <stop offset="1" stopColor="#8B5CF6" />
      </linearGradient>
      <linearGradient
        id="dotGradient3"
        x1="95"
        y1="140"
        x2="105"
        y2="140"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#3B82F6" />
        <stop offset="1" stopColor="#8B5CF6" />
      </linearGradient>
      <linearGradient
        id="pulseGradient"
        x1="60"
        y1="100"
        x2="140"
        y2="100"
        gradientUnits="userSpaceOnUse"
      >
        <stop stopColor="#3B82F6" />
        <stop offset="1" stopColor="#8B5CF6" />
      </linearGradient>
    </defs>

    {/* Layers */}
    <g>
      {/* Outer Glow */}
      <circle cx="100" cy="100" r="90" fill="url(#gradientOuter)" fillOpacity="0.15" />
      {/* Middle Ring */}
      <circle
        cx="100"
        cy="100"
        r="60"
        stroke="url(#gradientMiddle)"
        strokeWidth="3"
        strokeDasharray="5 5"
      />
      {/* Inner Core */}
      <circle cx="100" cy="100" r="40" fill="url(#gradientInner)" fillOpacity="0.3" />
    </g>

    {/* Bot Face */}
    <g className="bot-face">
      <circle cx="100" cy="80" r="25" fill="url(#faceGradient)" />
      <circle cx="90" cy="73" r="4" fill="#fff" />
      <circle cx="110" cy="73" r="4" fill="#fff" />
      <path
        d="M90 90 Q100 100 110 90"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
    </g>

    {/* Antenna */}
    <g className="antenna">
      <line x1="100" y1="55" x2="100" y2="40" stroke="url(#antennaGradient)" strokeWidth="3" />
      <circle cx="100" cy="35" r="6" fill="url(#antennaGradient)" />
    </g>

    {/* Orbiting Elements */}
    <g className="orbiting-elements">
      <circle cx="140" cy="100" r="6" fill="url(#dotGradient1)" />
      <circle cx="60" cy="100" r="6" fill="url(#dotGradient2)" />
      <circle cx="100" cy="140" r="6" fill="url(#dotGradient3)" />
    </g>

    {/* Pulse Effect */}
    <circle
      className="pulse"
      cx="100"
      cy="100"
      r="50"
      stroke="url(#pulseGradient)"
      strokeWidth="2"
      strokeDasharray="4 4"
      fill="none"
    />

    {/* Animation Styles */}
    <style>{`
      .orbiting-elements {
        animation: orbit 12s linear infinite;
        transform-origin: 100px 100px;
      }
      .pulse {
        animation: pulse 2.5s ease-in-out infinite;
        transform-origin: 100px 100px;
      }
      @keyframes orbit {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      @keyframes pulse {
        0% { opacity: 0.3; transform: scale(0.9); }
        50% { opacity: 1; transform: scale(1.1); }
        100% { opacity: 0.3; transform: scale(0.9); }
      }
    `}</style>
  </svg>
);

const ChatInterface = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { isDarkMode, toggleTheme } = useTheme();
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [successMessage, setSuccessMessage] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch products when component mounts
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const productData = await fetchProducts();
        setProducts(productData);
      } catch (error) {
        setError('Failed to load product information');
      } finally {
        setIsLoadingProducts(false);
      }
    };

    loadProducts();
  }, []);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        const orderData = await fetchUserOrders();
        setOrders(orderData);
      } catch (error) {
        setError('Failed to load order information');
      } finally {
        setIsLoadingOrders(false);
      }
    };

    loadOrders();
  }, []);

  useEffect(() => {
    const fetchRefunds = async () => {
      try {
        const refunds = await getAllUserRefunds();
      } catch (error) {
        // Handle error silently
      }
    };

    fetchRefunds();
  }, []);

  // Add a new useEffect to ensure userId is extracted and stored from token
  useEffect(() => {
    const extractUserIdFromToken = () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const tokenData = JSON.parse(atob(token.split('.')[1]));
        const userId = tokenData.id || tokenData.userId || tokenData._id || tokenData.sub;
        
        if (userId) {
          localStorage.setItem('userId', userId);
        }
      } catch (error) {
        // Handle error silently
      }
    };
    
    extractUserIdFromToken();
  }, []);

  // Add this useEffect to check API health when the component mounts
  useEffect(() => {
    const checkApi = async () => {
      try {
        const isHealthy = await checkApiHealth();
        if (!isHealthy) {
          setError('API is not accessible. Please try again later.');
        }
      } catch (error) {
        // Handle error silently
      }
    };
    
    checkApi();
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    // Keep track of ongoing refund conversations
    const isRefundConditionResponse = 
      newMessage.trim().length < 20 && 
      ['unopened', 'defective', 'wrong item', 'other'].includes(newMessage.toLowerCase()) &&
      messages.length > 0 && 
      messages[messages.length-1].role === 'assistant' && 
      messages[messages.length-1].content.includes('reason for the refund');
      
    // Check if user is directly asking to see refunds
    const isRefundViewRequest = newMessage.toLowerCase().includes('show refunds') || 
                             newMessage.toLowerCase().includes('view refunds') ||
                             newMessage.toLowerCase().includes('my refunds') ||
                             newMessage.toLowerCase().includes('refund status') ||
                             newMessage.toLowerCase().includes('show my refunds') ||
                             newMessage.toLowerCase().includes('check refunds') ||
                             newMessage.toLowerCase().includes('show returns') ||
                             newMessage.toLowerCase().includes('my returns');
                             
    // If this is a refund condition response, modify the message to help the AI understand context
    const messageToSend = isRefundConditionResponse ? 
      `Refund condition: ${newMessage}` : newMessage;

    const userMessage = { role: 'user', content: newMessage };
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');

    try {
      // Check if user is asking for orders - refresh data if so
      const isOrderRequest = newMessage.toLowerCase().includes('show orders') || 
                           newMessage.toLowerCase().includes('list orders') ||
                           newMessage.toLowerCase().includes('my orders') ||
                           newMessage.toLowerCase().includes('order history') ||
                           newMessage.toLowerCase().includes('show my orders') ||
                           newMessage.toLowerCase().includes('view orders') ||
                           newMessage.toLowerCase().includes('see my orders') ||
                           newMessage.toLowerCase().includes('check orders') ||
                           newMessage.toLowerCase().includes('recent orders');
      
      // Refresh orders data if user is asking about orders
      if (isOrderRequest) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'Fetching your latest order information...'
        }]);
        
        try {
          console.log("Refreshing orders data from API...");
          // Clear existing orders first to prevent showing stale data
          setOrders([]);
          const updatedOrders = await fetchUserOrders();
          setOrders(updatedOrders);
          console.log("Orders refreshed:", updatedOrders);
        } catch (error) {
          console.error('Error refreshing orders:', error);
          setError('Failed to load your orders. Please try again.');
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: '❌ I had trouble retrieving your orders. Please try again in a moment.'
          }]);
          setIsLoading(false);
          return;
        }
      }
      
      // If user is directly asking to see refunds, fetch them first
      if (isRefundViewRequest) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'Fetching your latest refund information...'
        }]);
        
        try {
          console.log("Directly fetching refund data...");
          // Fetch fresh refund data
          const refunds = await getAllUserRefunds();
          
          // Format refunds in a structured way
          const statusMessage = `### Here are your refund requests:\n\n${refunds.map(refund => {
            // Format message based on refund data
            let message = '';
            if (refund._id.includes('_refund')) {
              // Handle pseudo-refund from order status
              message = `**Order #${refund.order_id}**\n` +
                       `Status: ${refund.status}\n` +
                       `Submitted: ${new Date(refund.createdAt).toLocaleDateString()}\n` +
                       `${refund.reason ? `Reason: ${refund.reason}\n` : ''}` +
                       `--------------------------`;
            } else {
              // Handle regular refund
              message = `**Refund ID: ${refund._id}**\n` +
                       `Order #${refund.order_id || 'Unknown'}\n` +
                       `Status: ${refund.status || 'Pending'}\n` +
                       `Reason: ${refund.reason || 'Not specified'}\n` +
                       `Condition: ${refund.condition || 'Not specified'}\n` +
                       `Submitted: ${refund.createdAt ? new Date(refund.createdAt).toLocaleDateString() : 'Unknown'}\n` +
                       `--------------------------`;
            }
            return message;
          }).join('\n\n')}`;
          
          // Remove loading message
          setMessages(prev => prev.filter(msg => 
            msg.content !== 'Fetching your latest refund information...' || msg.role !== 'assistant'));
          
          if (!refunds || refunds.length === 0) {
            setMessages(prev => [...prev, { 
              role: 'assistant', 
              content: "You don't have any refund requests yet. Would you like to create a new refund request?"
            }]);
          } else {
            setMessages(prev => [...prev, { 
              role: 'assistant', 
              content: statusMessage
            }]);
          }
          
          setIsLoading(false);
          return;
        } catch (error) {
          console.error('Error fetching refunds:', error);
          // Continue with AI response in case of error
        }
      }
      
      const aiResponse = await generateAIResponse(messageToSend, products, orders);
      
      // Remove the "fetching" message if it was added
      if (isOrderRequest) {
        setMessages(prev => prev.filter(msg => 
          msg.role !== 'assistant' || msg.content !== 'Fetching your latest order information...'));
      }
      
      // Check for delete order commands
      const deleteMatch = aiResponse.match(/\[DELETE_ORDER:([^\]]+)\]/);
      if (deleteMatch) {
        const [_, orderId] = deleteMatch;
        
        try {
          // Show processing message
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: `Processing order cancellation for #${orderId}...`
          }]);
          
          // Delete the order
          const deleteResult = await deleteOrder(orderId);
          
          // Refresh orders list
          const updatedOrders = await fetchUserOrders();
          setOrders(updatedOrders);
          
          setSuccessMessage('Order cancelled successfully!');
          
          // Remove processing message and add success message
          setMessages(prev => prev.filter(msg => 
            msg.content !== `Processing order cancellation for #${orderId}...` || msg.role !== 'assistant'));
            
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: `✅ I've successfully cancelled your order #${orderId}. The products have been returned to stock.`
          }]);
        } catch (error) {
          setError(`Failed to cancel order: ${error.message}`);
          
          // Add error message to chat
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: `❌ I couldn't cancel your order: ${error.message}. Please try again or contact customer support.`
          }]);
        }
      }

      // Check for order update commands
      const updateMatch = aiResponse.match(/\[UPDATE_ORDER:([^:]+):(\[.*?\])\]/);
      if (updateMatch) {
        const [_, orderId, productsJson] = updateMatch;
        const updatedProducts = JSON.parse(productsJson);
        
        // Update the order
        const updatedOrder = await updateOrderItems(orderId, updatedProducts);
        
        // Refresh orders list
        const updatedOrders = await fetchUserOrders();
        setOrders(updatedOrders);
        
        setSuccessMessage('Order updated successfully!');
      }

      // Handle existing order creation logic
      const orderMatches = aiResponse.match(/\[ORDER_PRODUCT:([^:]+):(\d+)\]/g);
      if (orderMatches) {
        const orderProducts = orderMatches.map(match => {
          const [_, productId, quantity] = match.match(/\[ORDER_PRODUCT:([^:]+):(\d+)\]/);
          
          const productDetails = products.find(p => p._id === productId);
          if (!productDetails) {
            throw new Error(`Product not found: ${productId}`);
          }
          
          return {
            id: productId,
            quantity: parseInt(quantity),
            price: productDetails.price,
            name: productDetails.name
          };
        });

        if (orderProducts.length > 0) {
          try {
            // Add a message to inform the user that the order is being processed
            setMessages(prev => [...prev, { 
              role: 'assistant', 
              content: `I'm processing your order now. Please wait a moment...`
            }]);
            
            // Check API health before creating order
            const isHealthy = await checkApiHealth();
            if (!isHealthy) {
              throw new Error('API is not accessible. Please try again later.');
            }
            
            // Create the order
            const newOrder = await createOrder(orderProducts);
            
            // Refresh orders list
            const updatedOrders = await fetchUserOrders();
            setOrders(updatedOrders);
            
            // Set success message
            setSuccessMessage(`Order created successfully! Total amount: $${newOrder.total_price.toFixed(2)}`);
            
            // Add success message to chat
            setMessages(prev => [...prev, { 
              role: 'assistant', 
              content: `✅ Great! I've placed your order successfully. Your order total is $${newOrder.total_price.toFixed(2)}. You can track your order status in your order history.`
            }]);
            
            // Ask about product quality
            setTimeout(() => {
              setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: `Thank you for your order! We'd love to hear how you would rate our service. Also, if you have any feedback on the product quality, please feel free to share!`
              }]);
            }, 1500);
          } catch (error) {
            setError(`Failed to create order: ${error.message}`);
            
            // Add error message to chat with more helpful information
            setMessages(prev => [...prev, { 
              role: 'assistant', 
              content: `❌ I couldn't place your order: ${error.message}. Please try again or contact customer support. If the problem persists, please provide the exact error message to our support team.`
            }]);
            
            // Add a follow-up message with suggestions
            setTimeout(() => {
              setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: `Would you like to try ordering again? Or would you prefer to check your existing orders first?`
              }]);
            }, 1500);
          }
        }
      }

      // Check for refund request commands
      const refundMatch = aiResponse.match(/\[REFUND_ORDER:([^:]+):([^:]+):([^\]]+)\]/);
      if (refundMatch) {
        const [_, orderId, reason, condition] = refundMatch;
        
        try {
          // Validate order ID format before attempting to create refund
          if (!orderId || typeof orderId !== 'string' || !/^[0-9a-fA-F]{24}$/.test(orderId)) {
            setError(`Invalid order ID format: ${orderId}. Please provide a valid order ID.`);
            setMessages(prev => [...prev, { 
              role: 'assistant', 
              content: `❌ I couldn't process your refund request because the order ID "${orderId}" is not valid. Please provide a valid order ID from your order history.`
            }]);
            return;
          }
          
          // Show processing message
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: `Processing your refund request for order #${orderId}...`
          }]);
          
          // Create the refund request
          const refundResult = await createRefund(orderId, reason, condition);
          
          storeRefundId(refundResult._id);
          
          setSuccessMessage('Refund request submitted successfully!');
          
          // Remove processing message and add success message
          setMessages(prev => prev.filter(msg => 
            msg.content !== `Processing your refund request for order #${orderId}...` || msg.role !== 'assistant'));
          
          // Add success message to chat
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: `✅ I've submitted your refund request for order #${orderId}. 
            Reason: ${reason}
            Condition: ${condition}
            You can check the status of your refund at any time by asking me to show your refunds.`
          }]);
        } catch (error) {
          setError(`Failed to process refund: ${error.message}`);
          
          // Check if it's an undelivered order error
          if (error.message.includes('Cannot process refund')) {
            // Get the current status from the error message
            const statusMatch = error.message.match(/Current status: ([^.]+)/);
            const currentStatus = statusMatch ? statusMatch[1] : 'not delivered';
            
            setMessages(prev => [...prev, { 
              role: 'assistant', 
              content: `❌ I couldn't process your refund request because the order is not delivered yet. Its current status is "${currentStatus}". Refunds are only available for orders that have been delivered. Please wait until your order is delivered, then try again.`
            }]);
          } else {
            // Add generic error message to chat
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: `❌ I couldn't process your refund request: ${error.message}. Please make sure you're using a valid order ID from your order history.`
          }]);
          }
        }
      }

      // Check for refund status check command
      const statusCheck = aiResponse.match(/\[GET_REFUND_STATUS\]/);
      if (statusCheck) {
        try {
          // Show loading message
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: 'Fetching your latest refund information...'
          }]);
          
          // Fetch fresh refund data
          console.log("Fetching fresh refund data due to GET_REFUND_STATUS command");
          const refunds = await getAllUserRefunds();
          
          // Remove loading message
          setMessages(prev => prev.filter(msg => 
            msg.content !== 'Fetching your latest refund information...' || msg.role !== 'assistant'));
          
          if (!refunds || refunds.length === 0) {
            setMessages(prev => [...prev, { 
              role: 'assistant', 
              content: "You don't have any refund requests yet. Would you like to create a new refund request?"
            }]);
            return;
          }
          
          // Format refunds in a structured way
          const statusMessage = `### Here are your refund requests:\n\n${refunds.map(refund => {
            // Format message based on refund data
            let message = '';
            if (refund._id.includes('_refund')) {
              // Handle pseudo-refund from order status
              message = `**Order #${refund.order_id}**\n` +
                       `Status: ${refund.status}\n` +
                       `Submitted: ${new Date(refund.createdAt).toLocaleDateString()}\n` +
                       `${refund.reason ? `Reason: ${refund.reason}\n` : ''}` +
                       `--------------------------`;
            } else {
              // Handle regular refund
              message = `**Refund ID: ${refund._id}**\n` +
                       `Order #${refund.order_id || 'Unknown'}\n` +
                       `Status: ${refund.status || 'Pending'}\n` +
                       `Reason: ${refund.reason || 'Not specified'}\n` +
                       `Condition: ${refund.condition || 'Not specified'}\n` +
                       `Submitted: ${refund.createdAt ? new Date(refund.createdAt).toLocaleDateString() : 'Unknown'}\n` +
                       `--------------------------`;
            }
            return message;
          }).join('\n\n')}`;
          
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: statusMessage
          }]);
        } catch (error) {
          setError(`Failed to fetch refund status: ${error.message}`);
          
          // Still provide a response even if there's an error
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: "I'm sorry, I encountered an error when trying to fetch your refund information. Please try again later or contact customer support for assistance."
          }]);
        }
      }

      // Check for order status command
      const orderStatusCheck = aiResponse.match(/\[GET_ORDER_STATUS\]/);
      if (orderStatusCheck) {
        try {
          // Fetch fresh order data
          console.log("Fetching fresh order data from API due to GET_ORDER_STATUS command");
          const freshOrders = await fetchUserOrders();
          setOrders(freshOrders);
          
          if (!freshOrders || freshOrders.length === 0) {
            setMessages(prev => [...prev, { 
              role: 'assistant', 
              content: "You don't have any orders yet. Would you like to browse our products and place an order?"
            }]);
            return;
          }
          
          // Format orders in a structured way
          const orderMessage = `Here are your orders:\n\n${freshOrders.map(order => {
            return `**Order #${order.id || order._id}**\n` +
                   `Status: ${order.status}\n` +
                   `Total Price: $${order.total_price}\n` +
                   `Order Date: ${order.order_date}\n` +
                   `Products:\n\n${order.products.map(p => 
                     `${p.quantity}x ${p.name} ($${p.price} each)${p.description ? ' - ' + p.description : ''}`
                   ).join('\n\n')}\n` +
                   `--------------------------`;
          }).join('\n\n')}`;
          
          // Replace the automated response with our freshly generated one
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: orderMessage
          }]);
          
          return;
        } catch (error) {
          setError(`Failed to fetch order status: ${error.message}`);
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: "I'm sorry, I encountered an error when trying to fetch your order information. Please try again later."
          }]);
        }
      }

      // Check for refund cancellation command
      const cancelMatch = aiResponse.match(/\[CANCEL_REFUND:([^\]]+)\]/);
      if (cancelMatch) {
        const [_, refundId] = cancelMatch;
        
        try {
          // Get all refunds first to validate the ID
          const refunds = await getAllUserRefunds();
          const refundToCancel = refunds.find(r => r._id === refundId);
          
          if (!refundToCancel) {
            throw new Error('Invalid refund ID. Please check the refund status and use the correct Refund ID.');
          }

          // Check if it's a real refund or a mock one from an order
          if (refundId.includes('_refund')) {
            // It's a mock refund from an order status, explain to the user
            setSuccessMessage('Please contact customer service to cancel this refund');
            setMessages(prev => [...prev, { 
              role: 'assistant', 
              content: `This refund was initiated through our order system. To cancel it, please contact our customer service team directly with your order number.`
            }]);
          } else {
            // It's a real refund, try to cancel it via API
            const cancelResult = await cancelRefund(refundId);
            
            if (cancelResult.success) {
              setSuccessMessage('Refund request cancelled successfully!');
              
              // Refresh the refunds list
              const updatedRefunds = await getAllUserRefunds();
              
              // Add success message to chat
              setMessages(prev => [...prev, { 
                role: 'assistant', 
                content: `✅ I've cancelled your refund request with Refund ID: ${refundId}. The request has been removed from your refund history.`
              }]);
            } else {
              throw new Error('Failed to cancel refund request');
            }
          }
        } catch (error) {
          setError(`Failed to cancel refund: ${error.message}`);
          
          // Add error message to chat
          setMessages(prev => [...prev, { 
            role: 'assistant', 
            content: `I couldn't cancel the refund. ${error.message} Let me show you your current refunds: [GET_REFUND_STATUS]`
          }]);
        }
      }

      // Update the cleanResponse to remove command tags
      const cleanResponse = aiResponse
        .replace(/\[DELETE_ORDER:[^\]]+\]/g, '')
        .replace(/\[UPDATE_ORDER:[^\]]+\]/g, '')
        .replace(/\[ORDER_PRODUCT:[^\]]+\]/g, '')
        .replace(/\[REFUND_ORDER:[^\]]+\]/g, '')
        .replace(/\[GET_REFUND_STATUS\]/g, '')
        .replace(/\[GET_ORDER_STATUS\]/g, '')
        .replace(/\[CANCEL_REFUND:[^\]]+\]/g, '');
      
      if (!deleteMatch && !updateMatch && !refundMatch && !statusCheck && !cancelMatch && !orderStatusCheck) {
        setMessages(prev => [...prev, { role: 'assistant', content: cleanResponse }]);
      }
    } catch (err) {
      setError('Failed to process request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    navigate('/');
  };

  // Add a loading state for products
  if (isLoadingProducts || isLoadingOrders) {
    return (
      <div className="chat-loading">
        <div className="loading-spinner"></div>
        <p>Loading information...</p>
      </div>
    );
  }

  return (
    <div className={`chat-container ${isDarkMode ? 'dark' : 'light'}`}>
      {/* Mobile Menu Button */}
      <button className="mobile-menu-button" onClick={() => setSidebarOpen(!sidebarOpen)}>
        <MenuOpen />
      </button>
      
      {/* Sidebar */}
      <div className={`chat-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h3>Customer Support</h3>
          <AIAssistantIllustration />
        </div>
        
        <div className="sidebar-content">
          <div className="sidebar-menu">
            <button className="menu-item active" onClick={() => {
              setMessages([]);
              setNewMessage('');
              setError('');
              setSuccessMessage('');
            }}>
              <History /> New Chat
            </button>
            <button 
              className="menu-item"
              onClick={() => {
                setNewMessage('show my refunds');
                handleSendMessage({ preventDefault: () => {} });
              }}
            >
              <Info /> My Refunds
            </button>
            <button 
    className="menu-item"
    onClick={() => {
      setNewMessage('show my orders');
      handleSendMessage({ preventDefault: () => {} });
    }}
  >
    <Info /> My Orders
            </button>
            
          </div>
        </div>
        
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-button">
            <ExitToApp /> Logout
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="chat-main">
        <div className="chat-header">
          <h2>AI Assistant</h2>
          <div className="header-controls">
            <button className="theme-toggle-header" onClick={toggleTheme} title="Toggle theme"> 
              {isDarkMode ? <Brightness7 /> : <Brightness4 />}
            </button>
          <span className="online-status">Online</span>
          </div>
        </div>

        <div className="chat-messages">
          {successMessage && (
            <div className="success-message">
              {successMessage}
            </div>
          )}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}
          {messages.map((msg, index) => (
            <div 
              key={index} 
              className={`message ${msg.role}`}
            >
              <div className="message-bubble message-content">
                {msg.role === 'assistant' ? (
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                ) : (
                  msg.content
                )}
              </div>
              <div className="message-time">
                {new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="message assistant loading">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="chat-input-form">
          
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={isLoading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
          />
        
          <button 
            type="submit" 
            className="send-button"
            disabled={isLoading || !newMessage.trim()}
            title="Send message"
          >
            <Send />
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;