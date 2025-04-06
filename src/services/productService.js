export const fetchProducts = async () => {
  try {
    const response = await fetch('https://product-api-90xc.onrender.com/api/products');
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}; 