# AI-Powered Customer Query Assistant

## 📋 Overview
An AI-driven customer query assistant built with React.js, designed to handle customer questions intelligently using integrated AI services like OpenAI. It provides a user-friendly chat interface that simulates real-time customer support.

## 🚀 Features
- 🧠 AI-powered response generation
- 💬 Real-time chat interface
- ⚡ Organized service layer for product, order, and refund queries
- 🎯 Context API and custom hooks for state management
- 🎨 Modern and customizable styling
- 📦 Scalable and clean code structure

## 🛠️ Tech Stack
- React.js
- JavaScript / TypeScript
- OpenAI API
- CSS Modules

## 📂 Project Structure
```
├── public/               # Static files
├── src/
│   ├── components/       # Reusable UI components
│   ├── containers/       # Page-level components
│   ├── contexts/         # Context API for state management
│   ├── hooks/            # Custom React hooks
│   ├── services/         # API interaction services
│       ├── aiService.js
│       ├── aiService.ts
│       ├── openaiService.js
│       ├── orderService.js
│       ├── productService.js
│       ├── refundService.js
│   ├── styles/           # CSS styles
│       ├── Auth.css
│       ├── ChatInterface.css
│   ├── types/            # TypeScript types
│   ├── App.js            # Main app component
│   ├── App.test.js       # Unit tests
│   ├── index.js          # Entry point
│   ├── index.css         # Global styles
├── package.json          # Project configuration
└── README.md             # Project documentation
```

## ⚙️ Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/sugunakula/AI-Powered-Customer-Query-Assistant.git
cd AI-Powered-Customer-Query-Assistant
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file at the root and add your OpenAI API key:
```
REACT_APP_OPENAI_API_KEY=your_openai_api_key
```

### 4. Start the Development Server
```bash
npm start
```

### 5. Build for Production
```bash
npm run build
```

## 💡 Usage
1. Navigate to the chat interface
2. Type customer queries in the input field
3. Receive AI-generated responses based on the query context
4. Access order history, product information, and refund policies through natural language

## 🔒 Security Considerations
- API keys are stored securely in environment variables
- User data is handled according to privacy best practices
- Rate limiting implemented to prevent API abuse

