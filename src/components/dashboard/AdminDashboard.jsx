import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Send, 
  AttachFile, 
  EmojiEmotions, 
  ExitToApp, 
  Dashboard,
  Chat,
  Notifications,
  Search,
  Refresh,
  MoreVert,
  Inventory,
  ShoppingCart,
  People,
  Help,
  Security,
  Add,
  Edit,
  Delete,
  Brightness4,
  Brightness7,
  CheckCircle,
  LocalShipping,
  PendingActions,
  LocalOffer as RefundIcon,
  ThumbUp as ApproveIcon,
  ThumbDown as RejectIcon,
  ContentCopy,
  PieChart as PieChartIcon,
  TrendingUp,
  AttachMoney,
  LocalMall,
  BarChart,
  Warning as WarningIcon,
  Save
} from '@mui/icons-material';
import { generateAIResponse } from '../../services/openaiService';
import { fetchProducts } from '../../services/productService';
import { fetchAllOrders, updateOrderAdmin, deleteOrderAdmin } from '../../services/orderService';
import { getAllRefunds, updateRefundStatus } from '../../services/refundService';
import '../../styles/ChatInterface.css';

const AdminDashboard = () => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'New order received', time: '2 mins ago', read: false },
    { id: 2, text: 'Product stock low', time: '5 mins ago', read: false },
    { id: 3, text: 'System update available', time: '1 hour ago', read: true }
  ]);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [activeTab, setActiveTab] = useState('products');
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    stock: '',
    category: '',
    description: ''
  });
  const theme = 'light';
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [orderStatus, setOrderStatus] = useState('Pending');
  const [refunds, setRefunds] = useState([]);
  const [isLoadingRefunds, setIsLoadingRefunds] = useState(false);
  const [refundError, setRefundError] = useState(null);
  const [dashboardStats, setDashboardStats] = useState({
    totalSales: 0,
    activeUsers: 0,
    conversionRate: 0,
    topProducts: [],
    recentOrders: [],
    lowStockProducts: []
  });
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Set theme to always be light - more aggressive approach
    document.documentElement.setAttribute('data-theme', 'light');
    document.body.classList.remove('dark-mode');
    document.body.classList.add('light-mode');
    // Store theme preference in localStorage to persist across refreshes
    localStorage.setItem('theme', 'light');
  }, []);

  // Check authentication status
  useEffect(() => {
    const checkAuth = () => {
      const auth = localStorage.getItem('isAuthenticated') === 'true';
      setIsAuthenticated(auth);
    };
    
    checkAuth();
    // Listen for authentication changes
    window.addEventListener('storage', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, []);

  // Fetch products when component mounts
  useEffect(() => {
    const loadProducts = async () => {
      try {
        const productData = await fetchProducts();
        setProducts(productData);
        setIsLoadingProducts(false);
      } catch (error) {
        setError('Failed to load product information');
        setIsLoadingProducts(false);
      }
    };

    loadProducts();
  }, []);

  // Fetch orders when component mounts
  useEffect(() => {
    const loadOrders = async () => {
      try {
        const orderData = await fetchAllOrders();
        setOrders(orderData);
        setIsLoadingOrders(false);
        // Calculate dashboard stats immediately after orders are loaded
        calculateDashboardStats();
      } catch (error) {
        setError('Failed to load order information');
        setIsLoadingOrders(false);
      }
    };

    loadOrders();
  }, []);

  // Fetch refunds when component mounts
  useEffect(() => {
    fetchRefunds();
  }, []);

  // Ensure dashboard analytics load when authentication is confirmed
  useEffect(() => {
    if (!isAuthenticated) return;
    
    // This effect ensures all necessary data is loaded when admin is authenticated
    const loadAllDashboardData = async () => {
      console.log("Loading dashboard data after authentication confirmed");
      setIsLoadingProducts(true);
      setIsLoadingOrders(true);
      
      try {
        // Load both products and orders in parallel
        const [productData, orderData] = await Promise.all([
          fetchProducts(),
          fetchAllOrders()
        ]);
        
        // Update state with fetched data
        setProducts(productData);
        setOrders(orderData);
        
        // Calculate dashboard stats after both data sets are loaded
        calculateDashboardStats();
        
        // Also fetch refunds data
        fetchRefunds();
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        setError('Failed to load dashboard information');
      } finally {
        setIsLoadingProducts(false);
        setIsLoadingOrders(false);
      }
    };
    
    // Set active tab to products on initial load
    setActiveTab('products');
    
    // Load all data
    loadAllDashboardData();
  }, [isAuthenticated]); // Only run when authentication status changes

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setIsLoading(true);
    setError('');

    const userMessage = { role: 'user', content: newMessage };
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');

    try {
      const aiResponse = await generateAIResponse(newMessage, products, orders);
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (err) {
      setError('Failed to process request. Please try again.');
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    navigate('/');
  };

  const handleRefresh = () => {
    setIsLoadingProducts(true);
    setIsLoadingOrders(true);
    fetchProducts().then(setProducts).finally(() => setIsLoadingProducts(false));
    fetchAllOrders().then(setOrders).then(() => {
      calculateDashboardStats();
      setIsLoadingOrders(false);
    });
    fetchRefunds();
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      price: product.price,
      stock: product.stock,
      category: product.category,
      description: product.description
    });
    setShowProductModal(true);
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(`https://product-api-90xc.onrender.com/api/products/${productId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          setProducts(products.filter(product => product._id !== productId));
        } else {
          throw new Error('Failed to delete product');
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('Failed to delete product');
      }
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const url = editingProduct 
        ? `https://product-api-90xc.onrender.com/api/products/${editingProduct._id}`
        : 'https://product-api-90xc.onrender.com/api/products';
        
      const method = editingProduct ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(productForm)
      });
      
      if (response.ok) {
        const updatedProduct = await response.json();
        
        if (editingProduct) {
          setProducts(products.map(p => 
            p._id === editingProduct._id ? updatedProduct : p
          ));
        } else {
          setProducts([...products, updatedProduct]);
        }
        
        setShowProductModal(false);
        setEditingProduct(null);
        setProductForm({
          name: '',
          price: '',
          stock: '',
          category: '',
          description: ''
        });
      } else {
        throw new Error('Failed to save product');
      }
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Failed to save product');
    }
  };

  const handleEditOrder = (order) => {
    setEditingOrder(order);
    setOrderStatus(order.status);
    setShowOrderModal(true);
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateOrderAdmin(orderId, { status: newStatus });
      handleRefresh(); // Refresh orders after update
    } catch (error) {
      console.error('Error updating order status:', error);
      setError('Failed to update order status');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await deleteOrderAdmin(orderId);
        handleRefresh(); // Refresh orders after deletion
      } catch (error) {
        console.error('Error deleting order:', error);
        setError('Failed to delete order');
      }
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending':
        return <PendingActions style={{ color: '#ff9800' }} />;
      case 'Shipped':
        return <LocalShipping style={{ color: '#2196f3' }} />;
      case 'Delivered':
        return <CheckCircle style={{ color: '#4caf50' }} />;
      default:
        return null;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const fetchRefunds = async () => {
    try {
      setIsLoadingRefunds(true);
      const refundData = await getAllRefunds();
      setRefunds(refundData);
      setRefundError(null);
    } catch (error) {
      console.error('Error fetching refunds:', error);
      setRefundError('Failed to fetch refunds');
    } finally {
      setIsLoadingRefunds(false);
    }
  };

  const handleUpdateRefundStatus = async (refundId, status) => {
    try {
      await updateRefundStatus(refundId, status);
      // Refresh refunds after update
      fetchRefunds();
    } catch (error) {
      console.error('Error updating refund status:', error);
      setRefundError(`Failed to update refund: ${error.message}`);
    }
  };

  const calculateDashboardStats = () => {
    try {
      // Calculate total sales
      const totalSales = orders.reduce((total, order) => total + order.total_price, 0);
      
      // Get random number of users for demo (in real app, fetch from API)
      const activeUsers = Math.floor(Math.random() * 50) + 10;
      
      // Calculate mock conversion rate
      const conversionRate = ((orders.length / (activeUsers + 20)) * 100).toFixed(1);
      
      // Get top products by order frequency
      const productCounts = {};
      orders.forEach(order => {
        order.products.forEach(item => {
          const productId = item.product_id;
          productCounts[productId] = (productCounts[productId] || 0) + item.quantity;
        });
      });
      
      // Sort products by order count
      const topProductIds = Object.keys(productCounts)
        .sort((a, b) => productCounts[b] - productCounts[a])
        .slice(0, 5);
        
      // Find product details for top products
      const topProducts = topProductIds.map(id => {
        const product = products.find(p => p._id === id);
        return {
          id,
          name: product ? product.name : 'Unknown Product',
          count: productCounts[id],
          revenue: product ? product.price * productCounts[id] : 0
        };
      });
      
      // Get 5 most recent orders
      const recentOrders = [...orders]
        .sort((a, b) => new Date(b.order_date) - new Date(a.order_date))
        .slice(0, 5);
      
      // Calculate inventory status
      const lowStockThreshold = 10;
      const lowStockProducts = products.filter(p => p.stock <= lowStockThreshold);
      
      // Generate data for order status pie chart
      const orderStatusCounts = {
        pending: orders.filter(o => o.status.toLowerCase() === 'pending').length,
        shipped: orders.filter(o => o.status.toLowerCase() === 'shipped').length,
        delivered: orders.filter(o => o.status.toLowerCase() === 'delivered').length,
        cancelled: orders.filter(o => o.status.toLowerCase() === 'cancelled').length
      };
      
      const orderStatusData = [
        { label: 'Pending', value: orderStatusCounts.pending, color: 'var(--warning-color)' },
        { label: 'Shipped', value: orderStatusCounts.shipped, color: 'var(--info-color)' },
        { label: 'Delivered', value: orderStatusCounts.delivered, color: 'var(--success-color)' },
        { label: 'Cancelled', value: orderStatusCounts.cancelled, color: 'var(--danger-color)' }
      ].filter(item => item.value > 0);
      
      // Generate data for product category bar chart
      const categoryCounts = {};
      products.forEach(product => {
        const category = product.category || 'Uncategorized';
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      });
      
      const categoryData = Object.keys(categoryCounts)
        .map((category, index) => {
          const colors = ['#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b', '#6f42c1'];
          return {
            label: category,
            value: categoryCounts[category],
            color: colors[index % colors.length]
          };
        })
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);
      
      // Add chart data to dashboard stats
      setDashboardStats({
        totalSales,
        activeUsers,
        conversionRate,
        topProducts,
        recentOrders,
        lowStockProducts: lowStockProducts.slice(0, 5),
        orderStatusData,
        categoryData
      });
    } catch (error) {
      console.error('Error calculating dashboard stats:', error);
    }
  };

  // Add status formatting functions
  const getStatusColor = (status) => {
    status = status.toLowerCase();
    switch(status) {
      case 'pending': return 'var(--warning-color, #f6c23e)';
      case 'shipped': return 'var(--info-color, #36b9cc)';
      case 'delivered': return 'var(--success-color, #1cc88a)';
      case 'cancelled': return 'var(--danger-color, #e74a3b)';
      default: return 'var(--gray-color, #858796)';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Add simple ProgressBar component
  const ProgressBar = ({ value, maxValue, color }) => {
    const percentage = Math.min(100, Math.round((value / maxValue) * 100));
    return (
      <div className="progress-bar-container">
        <div 
          className="progress-bar-fill" 
          style={{ 
            width: `${percentage}%`, 
            backgroundColor: color || 'var(--primary-color)' 
          }}
        />
        <span className="progress-bar-label">{percentage}%</span>
      </div>
    );
  };

  // Add simple PieChart component
  const SimplePieChart = ({ data }) => {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;
    
  return (
      <div className="simple-pie-chart">
        <svg viewBox="0 0 100 100">
          {data.map((item, index) => {
            const startAngle = currentAngle;
            const slicePercentage = (item.value / total) * 100;
            const angleSize = (slicePercentage / 100) * 360;
            currentAngle = startAngle + angleSize;
            
            // Convert angles to radians for calculation
            const startAngleRad = (startAngle - 90) * (Math.PI / 180);
            const endAngleRad = (currentAngle - 90) * (Math.PI / 180);
            
            // Calculate arc path
            const x1 = 50 + 50 * Math.cos(startAngleRad);
            const y1 = 50 + 50 * Math.sin(startAngleRad);
            const x2 = 50 + 50 * Math.cos(endAngleRad);
            const y2 = 50 + 50 * Math.sin(endAngleRad);
            
            // Determine if the slice is bigger than 180 degrees
            const largeArcFlag = angleSize > 180 ? 1 : 0;
            
            // Create SVG arc path
            const pathData = `
              M 50 50
              L ${x1} ${y1}
              A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2}
              Z
            `;
            
            return (
              <path
                key={index}
                d={pathData}
                fill={item.color}
                stroke="#fff"
                strokeWidth="1"
              />
            );
          })}
        </svg>
        <div className="pie-chart-legend">
          {data.map((item, index) => (
            <div key={index} className="legend-item">
              <span className="color-indicator" style={{ backgroundColor: item.color }}></span>
              <span className="legend-label">{item.label}</span>
              <span className="legend-value">{Math.round((item.value / total) * 100)}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Add simple LineChart component
  const SimpleBarChart = ({ data, maxValue }) => {
    const highestValue = maxValue || Math.max(...data.map(item => item.value));
    
    return (
      <div className="simple-bar-chart">
        {data.map((item, index) => (
          <div key={index} className="bar-container">
            <div className="bar-label">{item.label}</div>
            <div className="bar-outer">
              <div 
                className="bar-inner" 
                style={{ 
                  width: `${(item.value / highestValue) * 100}%`,
                  backgroundColor: item.color || 'var(--primary-color)'
                }}
              >
                <span className="bar-value">{item.value}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Add a utility function to generate colors
  const getRandomColor = (seed) => {
    // Simple deterministic color generator based on string seed
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    const colors = [
      '#4e73df', '#1cc88a', '#36b9cc', '#f6c23e', '#e74a3b',
      '#6f42c1', '#fd7e14', '#20c9a6', '#5a5c69', '#858796'
    ];
    return colors[Math.abs(hash) % colors.length];
  };

  if (isLoadingProducts || isLoadingOrders) {
    return (
      <div className="chat-loading">
        <div className="loading-spinner"></div>
        <p>Loading information...</p>
      </div>
    );
  }

  const renderMainContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="dashboard-content">
            <div className="dashboard-header">
              <h2>Dashboard Overview</h2>
              <div className="dashboard-actions">
                <button className="refresh-button" onClick={handleRefresh}>
                  <Refresh /> Refresh Data
                </button>
              </div>
            </div>
            <div className="dashboard-stats">
              <div className="stat-card">
                <div className="stat-icon"><ShoppingCart /></div>
                <div className="stat-info">
                  <h3>{orders.length}</h3>
                  <p>Total Orders</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"><Inventory /></div>
                <div className="stat-info">
                  <h3>{products.length}</h3>
                  <p>Total Products</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"><AttachMoney /></div>
                <div className="stat-info">
                  <h3>${dashboardStats.totalSales.toFixed(2)}</h3>
                  <p>Total Sales</p>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"><TrendingUp /></div>
                <div className="stat-info">
                  <h3>{dashboardStats.conversionRate}%</h3>
                  <p>Conversion Rate</p>
                </div>
              </div>
            </div>
            <div className="dashboard-charts">
              <div className="chart-container">
                <div className="chart-header">
                  <h3>Recent Orders</h3>
                  <BarChart className="chart-icon" />
                </div>
                <div className="chart-content">
                  <div className="chart-visualization">
                    <SimplePieChart data={dashboardStats.orderStatusData || []} />
                  </div>
                  <div className="chart-details">
                    <h4>Order Status</h4>
                    {dashboardStats.recentOrders.length > 0 ? (
                      <div className="recent-orders-list">
                        <table className="mini-table">
                          <thead>
                            <tr>
                              <th>Order ID</th>
                              <th>Customer</th>
                              <th>Amount</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {dashboardStats.recentOrders.map(order => (
                              <tr key={order._id}>
                                <td>#{order._id.substring(0, 8)}</td>
                                <td>{order.user_id?.name || 'Unknown'}</td>
                                <td>{formatCurrency(order.total_price)}</td>
                                <td>
                                  <span 
                                    className="status-badge" 
                                    style={{backgroundColor: getStatusColor(order.status)}}
                                  >
                                    {order.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="chart-placeholder">No recent orders found</div>
                    )}
                  </div>
                </div>
              </div>
              <div className="chart-container">
                <div className="chart-header">
                  <h3>Product Categories</h3>
                  <PieChartIcon className="chart-icon" />
                </div>
                <div className="chart-content">
                  <div className="chart-visualization">
                    <SimpleBarChart data={dashboardStats.categoryData || []} />
                  </div>
                  <div className="chart-details">
                    <h4>Top Products</h4>
                    {dashboardStats.topProducts.length > 0 ? (
                      <div className="top-products-list">
                        <table className="mini-table">
                          <thead>
                            <tr>
                              <th>Product</th>
                              <th>Sales</th>
                              <th>Revenue</th>
                            </tr>
                          </thead>
                          <tbody>
                            {dashboardStats.topProducts.map(product => (
                              <tr key={product.id}>
                                <td>{product.name}</td>
                                <td>
                                  <ProgressBar 
                                    value={product.count} 
                                    maxValue={dashboardStats.topProducts[0].count}
                                    color={getRandomColor(product.name)}
                                  />
                                </td>
                                <td>{formatCurrency(product.revenue)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="chart-placeholder">No product data available</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="dashboard-summary">
              <div className="summary-card">
                <h3>Order Summary</h3>
                <div className="summary-stats">
                  <div className="summary-stat">
                    <span className="stat-label">Pending</span>
                    <span className="stat-value">{orders.filter(o => o.status.toLowerCase() === 'pending').length}</span>
                  </div>
                  <div className="summary-stat">
                    <span className="stat-label">Shipped</span>
                    <span className="stat-value">{orders.filter(o => o.status.toLowerCase() === 'shipped').length}</span>
                  </div>
                  <div className="summary-stat">
                    <span className="stat-label">Delivered</span>
                    <span className="stat-value">{orders.filter(o => o.status.toLowerCase() === 'delivered').length}</span>
                  </div>
                  <div className="summary-stat">
                    <span className="stat-label">Cancelled</span>
                    <span className="stat-value">{orders.filter(o => o.status.toLowerCase() === 'cancelled').length}</span>
                  </div>
                </div>
                
              </div>
              <div className="summary-card">
                <h3>Refund Requests</h3>
                <div className="summary-stats">
                  <div className="summary-stat">
                    <span className="stat-label">Pending</span>
                    <span className="stat-value">{refunds.filter(r => r.status === 'Pending').length}</span>
                  </div>
                  <div className="summary-stat">
                    <span className="stat-label">Approved</span>
                    <span className="stat-value">{refunds.filter(r => r.status === 'Approved').length}</span>
                  </div>
                  <div className="summary-stat">
                    <span className="stat-label">Rejected</span>
                    <span className="stat-value">{refunds.filter(r => r.status === 'Rejected').length}</span>
                  </div>
                </div>
                
              </div>
            </div>
            
          </div>
        );
      case 'chat':
        return (
          <div className="admin-chat-content">
            <div className="admin-chat-container">
              <div className="admin-chat-main">
                <div className="admin-chat-messages" ref={messagesEndRef}>
                  <div className="admin-chat-date-divider">
                    <span>Today</span>
                  </div>
                  
                  {messages.length === 0 && (
                    <div className="admin-chat-empty">
                      <div className="empty-icon">
                        <Chat style={{ fontSize: 48 }} />
                      </div>
                      <h3>No messages yet</h3>
                      <p>Use the AI assistant to help with customer queries, order management, and product information.</p>
                    </div>
                  )}
                  
                  {messages.map((message, index) => (
                    <div key={index} className={`admin-message ${message.role}`}>
                      <div className="message-avatar">
                        {message.role === 'user' ? 'U' : 'A'}
                      </div>
                      <div className="message-bubble">
                        <div className="message-info">
                          <span className="message-sender">
                            {message.role === 'user' ? 'You (Admin)' : 'AI Assistant'}
                          </span>
                          <span className="message-time">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        <div className="message-content">{message.content}</div>
                        <div className="message-actions">
                          {message.role === 'assistant' && (
                            <>
                              <button title="Save as template" onClick={() => {}}>
                                <Save />
                              </button>
                              <button title="Copy to clipboard" onClick={() => {
                                navigator.clipboard.writeText(message.content);
                                alert("Copied to clipboard!");
                              }}>
                                <ContentCopy fontSize="small" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {isLoading && (
                    <div className="admin-message assistant">
                      <div className="message-avatar">A</div>
                      <div className="message-bubble">
                        <div className="message-info">
                          <span className="message-sender">AI Assistant</span>
                          <span className="message-time">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        <div className="typing-indicator">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSendMessage} className="admin-chat-input">
                  <div className="admin-input-context">
                    <select defaultValue="general" onChange={(e) => {}}>
                      <option value="general">General</option>
                      <option value="orders">Orders</option>
                      <option value="refunds">Refunds</option>
                    </select>
                  </div>
                  <div className="admin-input-main">
                    <AttachFile className="input-icon" />
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type admin command or question..."
                      disabled={isLoading}
                    />
                    <EmojiEmotions className="input-icon" />
                  </div>
                  <button 
                    type="submit" 
                    className="admin-send-button"
                    disabled={isLoading || !newMessage.trim()}
                  >
                    <Send />
                  </button>
                </form>
              </div>
              
              <div className="admin-chat-info">
                <div className="info-header">
                  <h3>Context Information</h3>
                  <button className="clear-chat-button" onClick={() => setMessages([])}>
                    <Refresh /> Clear Chat
                  </button>
                </div>
                <div className="info-section">
                  <h4>Recent Orders</h4>
                  <ul className="info-list">
                    {orders.slice(0, 3).map(order => (
                      <li key={order._id} className="info-item">
                        <div className="info-item-title">Order #{order._id.substring(0, 8)}</div>
                        <div className="info-item-subtitle">{order.user_id?.name || 'Unknown'}</div>
                        <div className="info-item-status">{order.status}</div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="info-section">
                  <h4>Popular Products</h4>
                  <ul className="info-list">
                    {products.slice(0, 3).map(product => (
                      <li key={product._id} className="info-item">
                        <div className="info-item-title">{product.name}</div>
                        <div className="info-item-subtitle">${product.price} - Stock: {product.stock}</div>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="info-section">
                  <h4>Admin Commands</h4>
                  <div className="command-list">
                    <div className="command-item">
                      <code>/order [id]</code>
                      <span>Lookup order details</span>
                    </div>
                    <div className="command-item">
                      <code>/user [email]</code>
                      <span>Find user information</span>
                    </div>
                    <div className="command-item">
                      <code>/refund [id]</code>
                      <span>Process refund request</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'settings':
        return (
          <div className="settings-content">
            <h2>Settings</h2>
            <div className="settings-grid">
              <div className="settings-card">
                <Security />
                <h3>Security Settings</h3>
                <p>Manage authentication and access control</p>
              </div>
              <div className="settings-card">
                <Help />
                <h3>Help & Support</h3>
                <p>Get assistance and documentation</p>
              </div>
            </div>
          </div>
        );
      case 'products':
        return (
          <div className="products-content">
            <div className="products-header">
              <h2>Product Management</h2>
              <button className="add-product-button" onClick={() => setShowProductModal(true)}style={{ 
                padding: '0.5rem 1rem',
                width: 'auto',
                minWidth: '120px'
              }}>
                <Add /> Add New Product
              </button>
            </div>
            <div className="products-table">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Category</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product._id}>
                      <td>{product.name}</td>
                      <td>${product.price}</td>
                      <td>{product.stock}</td>
                      <td>{product.category}</td>
                      <td>{product.description}</td>
                      <td className="actions">
                        <button 
                          className="edit-button"
                          onClick={() => handleEditProduct(product)}
                        >
                          <Edit />
                        </button>
                        <button 
                          className="delete-button"
                          onClick={() => handleDeleteProduct(product._id)}
                        >
                          <Delete />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {showProductModal && (
              <div className="modal-overlay" style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 1000,
                backdropFilter: 'blur(2px)'
              }}>
                <div className="modal-content" style={{
                  backgroundColor: 'white',
                  padding: '2rem',
                  borderRadius: '8px',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                  width: '100%',
                  maxWidth: '500px'
                }}>
                  <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                  <form onSubmit={handleProductSubmit}>
                    <div className="form-group">
                      <label>Name</label>
                      <input
                        type="text"
                        value={productForm.name}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Price</label>
                      <input
                        type="number"
                        value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Stock</label>
                      <input
                        type="number"
                        value={productForm.stock}
                        onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                        min="0"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Category</label>
                      <input
                        type="text"
                        value={productForm.category}
                        onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Description</label>
                      <textarea
                        value={productForm.description}
                        onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                        required
                      />
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '1rem',
                        marginTop: '1.5rem',
                      }}
                    >
                      <button
                        type="button"
                        style={{
                          padding: '0.5rem 1.5rem',
                          border: 'none',
                          borderRadius: '5px',
                          background: '#ccc',
                          cursor: 'pointer',
                        }}
                        onClick={() => setShowProductModal(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        style={{
                          padding: '0.5rem 1.5rem',
                          border: 'none',
                          borderRadius: '5px',
                          background: '#4CAF50',
                          color: '#fff',
                          cursor: 'pointer',
                        }}
                      >
                        {editingProduct ? 'Update' : 'Add'} Product
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        );
      case 'orders':
        return (
          <div className="orders-content">
            <div className="orders-header">
              <h2>Order Management</h2>
              <button className="refresh-button" onClick={handleRefresh} style={{ 
                padding: '0.5rem 1rem',
                width: 'auto',
                minWidth: '120px'
              }}>
                <Refresh /> Refresh Orders
              </button>
            </div>
            <div className="orders-table">
              <table>
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Products</th>
                    <th>Total Price</th>
                    <th>Status</th>
                    <th>Order Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order._id}>
                      <td>{order._id.substring(0, 8)}...</td>
                      <td>
                        {order.user_id && (
                          <div className="customer-info">
                            <div className="customer-name">{order.user_id.name || 'Unknown'}</div>
                            <div className="customer-email">{order.user_id.email || 'No email'}</div>
                          </div>
                        )}
                      </td>
                      <td>
                        {order.products.map((item, index) => (
                          <div key={index} className="order-product">
                            {item.product_id.substring(0, 8)}... (Qty: {item.quantity})
                          </div>
                        ))}
                      </td>
                      <td>{order.total_price.toFixed(2)}</td>
                      <td>
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateOrderStatus(order._id, e.target.value)}
                          className={`order-status status-${order.status.toLowerCase()}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                        <button
                          onClick={() => handleDeleteOrder(order._id)}
                          className="delete-button"
                        >
                          <Delete />
                        </button>
                      </td>
                      <td>{formatDate(order.order_date)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {showOrderModal && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <h3>Update Order Status</h3>
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    handleUpdateOrderStatus(editingOrder._id, orderStatus);
                    setShowOrderModal(false);
                    setEditingOrder(null);
                  }}>
                    <div className="form-group">
                      <label>Order ID</label>
                      <input
                        type="text"
                        value={editingOrder._id}
                        disabled
                      />
                    </div>
                    <div className="form-group">
                      <label>Customer</label>
                      <input
                        type="text"
                        value={editingOrder.user_id ? `${editingOrder.user_id.name} (${editingOrder.user_id.email})` : 'Unknown'}
                        disabled
                      />
                    </div>
                    <div className="form-group">
                      <label>Current Status</label>
                      <input
                        type="text"
                        value={editingOrder.status}
                        disabled
                      />
                    </div>
                    <div className="form-group">
                      <label>New Status</label>
                      <select
                        value={orderStatus}
                        onChange={(e) => setOrderStatus(e.target.value)}
                        required
                      >
                        <option value="Pending">Pending</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </div>
                    <div className="modal-actions">
                      <button type="button" onClick={() => setShowOrderModal(false)}>
                        Cancel
                      </button>
                      <button type="submit">
                        Update Status
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        );
      case 'refunds':
        return (
          <div className="refunds-content">
            <div className="refunds-header">
              <h2>Refund Requests</h2>
              <button className="refresh-button" onClick={fetchRefunds} style={{ 
                padding: '0.5rem 1rem',
                width: 'auto',
                minWidth: '120px'
              }}>
                <Refresh /> Refresh
              </button>
            </div>
            
            {refundError && <div className="error-message">{refundError}</div>}
            
            {isLoadingRefunds ? (
              <div className="loading-spinner-container">
                <div className="loading-spinner"></div>
                <p>Loading refunds...</p>
              </div>
            ) : (
              <div className="refunds-table">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Customer</th>
                      <th>Order ID</th>
                      <th>Reason</th>
                      <th>Condition</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {refunds.length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center' }}>No refund requests found</td>
                      </tr>
                    ) : (
                      refunds.map(refund => (
                        <tr key={refund._id}>
                          <td>{refund._id.substring(0, 8)}...</td>
                          <td>
                            <div className="customer-info">
                              <span className="customer-name">{refund.user_id?.name || 'Unknown'}</span>
                              <span className="customer-email">{refund.user_id?.email || 'Unknown'}</span>
                            </div>
                          </td>
                          <td style={{ color: '#000', fontWeight: '500' }}>{refund.order_id?._id || refund.order_id}</td>
                          <td>{refund.reason}</td>
                          <td>{refund.condition}</td>
                          <td>
                            <span className={`status-badge status-${refund.status.toLowerCase()}`} style={{
                              color: '#fff',
                              fontWeight: 'bold',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              backgroundColor: refund.status === 'Pending' ? '#f6c23e' : 
                                              refund.status === 'Approved' ? '#1cc88a' : '#e74a3b'
                            }}>
                              {refund.status}
                            </span>
                          </td>
                          <td>{new Date(refund.createdAt).toLocaleDateString()}</td>
                          <td>
                            {refund.status === 'Pending' && (
                              <div className="refund-actions">
                                <button 
                                  className="approve-button"
                                  onClick={() => handleUpdateRefundStatus(refund._id, 'Approved')}
                                  title="Approve Refund"
                                >
                                  <ApproveIcon />
                                </button>
                                <button 
                                  className="reject-button"
                                  onClick={() => handleUpdateRefundStatus(refund._id, 'Rejected')}
                                  title="Reject Refund"
                                >
                                  <RejectIcon />
                                </button>
                              </div>
                            )}
                            {refund.status !== 'Pending' && (
                              <span className="status-processed">
                                {refund.status === 'Approved' ? 'Approved' : 'Rejected'}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="sidebar-header">
          <h2>Admin Panel</h2>
        </div>
        <div className="sidebar-content">
          <div className="sidebar-section">
            <h3>Main Menu</h3>
            <button 
              className={`sidebar-button ${activeTab === 'dashboard' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('dashboard');
                // Refresh all data when dashboard is clicked
                setIsLoadingProducts(true);
                setIsLoadingOrders(true);
                
                // Use Promise.all for better performance
                Promise.all([
                  fetchProducts(), 
                  fetchAllOrders(),
                  getAllRefunds()
                ])
                .then(([productData, orderData, refundData]) => {
                  setProducts(productData);
                  setOrders(orderData);
                  setRefunds(refundData);
                  calculateDashboardStats();
                })
                .catch(error => {
                  console.error('Error refreshing data:', error);
                  setError('Failed to refresh dashboard data');
                })
                .finally(() => {
                  setIsLoadingProducts(false);
                  setIsLoadingOrders(false);
                });
              }}
            >
              <Dashboard /> Dashboard
            </button>
          </div>
          <div className="sidebar-section">
            <h3>Management</h3>
            <button 
              className={`sidebar-button ${activeTab === 'products' ? 'active' : ''}`}
              onClick={() => setActiveTab('products')}
            >
              <Inventory /> Products
            </button>
            <button 
              className={`sidebar-button ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              <ShoppingCart /> Orders
            </button>
            <button 
              className={`sidebar-button ${activeTab === 'refunds' ? 'active' : ''}`}
              onClick={() => setActiveTab('refunds')}
            >
              <RefundIcon />
              Refunds
            </button>
          </div>
        </div>
        <div className="sidebar-footer">
          <button onClick={handleLogout} className="logout-button">
            <ExitToApp /> Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="admin-main">
        <div className="admin-header">
          <div className="header-left">
            <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
          </div>
        </div>
        <div className="admin-content">
          {renderMainContent()}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard; 