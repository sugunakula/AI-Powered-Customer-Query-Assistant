export const fetchAIResponse = async (message) => {
  // This would be replaced with actual API call
  return new Promise((resolve) => {
    setTimeout(() => {
      const responses = {
        'Track my order': {
          text: "To track your order, please provide your order number and I'll help you check its status.",
          sentiment: 'neutral',
          quickReplies: ['Enter order number', 'View recent orders'],
          preview: null
        },
        'Return policy': {
          text: "Our return policy allows returns within 30 days of purchase. Items must be unused and in original packaging.",
          sentiment: 'informative',
          quickReplies: ['Start a return', 'Print return label'],
          preview: {
            type: 'pdf',
            url: '/policies/returns.pdf',
            title: 'Return Policy Document'
          }
        }
      };

      const defaultResponse = {
        text: "I'm here to help! How can I assist you today?",
        sentiment: 'friendly',
        quickReplies: ['Track order', 'Return item', 'Check availability'],
        preview: null
      };

      resolve(responses[message] || defaultResponse);
    }, 1000);
  });
}; 