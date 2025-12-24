# Expense Sharing Application - MERN Stack

A modern full-stack web application for splitting and tracking shared expenses among groups, similar to Splitwise.

## 📋 Project Overview

This application allows users to:
- **Create groups** with multiple members
- **Add shared expenses** with flexible split options
- **Track balances** - see who owes whom
- **Settle dues** - manage payment settlements
- **Support multiple split types**:
  - Equal split (divide equally among participants)
  - Exact amount split (specify exact amount per person)
  - Percentage split (divide by percentage)

## 🏗️ Project Structure

```
sharing_apll/
├── backend/                    # Node.js & Express API
│   ├── models/                # MongoDB schemas
│   │   ├── User.js
│   │   ├── Group.js
│   │   ├── Expense.js
│   │   └── Balance.js
│   ├── controllers/           # Business logic
│   │   ├── userController.js
│   │   ├── groupController.js
│   │   ├── expenseController.js
│   │   └── balanceController.js
│   ├── routes/               # API endpoints
│   │   ├── userRoutes.js
│   │   ├── groupRoutes.js
│   │   ├── expenseRoutes.js
│   │   └── balanceRoutes.js
│   ├── middleware/           # Authentication
│   │   └── auth.js
│   ├── utils/               # Helper functions
│   │   ├── splitCalculator.js
│   │   └── balanceCalculator.js
│   ├── server.js            # Express server setup
│   ├── package.json
│   └── .env                 # Environment variables
│
└── frontend/                 # React application
    ├── src/
    │   ├── components/      # Reusable components
    │   │   ├── Navigation.js
    │   │   └── ProtectedRoute.js
    │   ├── pages/          # Page components
    │   │   ├── Login.js
    │   │   ├── Register.js
    │   │   ├── Groups.js
    │   │   └── GroupDetail.js
    │   ├── context/        # React context
    │   │   └── AuthContext.js
    │   ├── api/            # API calls
    │   │   └── axios.js
    │   ├── styles/         # CSS styles
    │   │   ├── Auth.css
    │   │   ├── Navigation.css
    │   │   ├── Groups.css
    │   │   ├── GroupDetail.css
    │   │   ├── index.css
    │   │   └── App.css
    │   ├── App.js          # Main app component
    │   ├── index.js        # React entry point
    │   └── App.css
    ├── public/
    │   └── index.html
    └── package.json
```

## 🛠️ Tech Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Frontend
- **React** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **CSS3** - Styling

## 📦 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

### Backend Setup

1. Navigate to the backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file and configure:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/expense-sharing-app
JWT_SECRET=your_secret_key_here_change_in_production
NODE_ENV=development
```

4. Start MongoDB (if using local):
```bash
mongod
```

5. Start the backend server:
```bash
npm start
# or for development with auto-reload
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (optional):
```env
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the React development server:
```bash
npm start
```

The frontend will open on `http://localhost:3000`

## 🔌 API Endpoints

### Authentication
- `POST /api/users/register` - Register a new user
- `POST /api/users/login` - Login user
- `GET /api/users/me` - Get current user (protected)
- `GET /api/users/:id` - Get user by ID (protected)

### Groups
- `POST /api/groups` - Create group (protected)
- `GET /api/groups` - Get all user's groups (protected)
- `GET /api/groups/:id` - Get group details (protected)
- `POST /api/groups/:groupId/members` - Add member to group (protected)
- `DELETE /api/groups/:groupId` - Delete group (protected)

### Expenses
- `POST /api/expenses` - Create expense (protected)
- `GET /api/expenses/group/:groupId` - Get group expenses (protected)
- `GET /api/expenses/:id` - Get expense details (protected)
- `DELETE /api/expenses/:id` - Delete expense (protected)

### Balances
- `GET /api/balances/group/:groupId` - Get group balances (protected)
- `GET /api/balances/group/:groupId/user/:userId` - Get user balance in group (protected)

## 💡 Key Features

### User Authentication
- Secure registration and login
- JWT-based authentication
- Password hashing with bcryptjs

### Group Management
- Create groups for shared expenses
- Add/remove members
- View group details and expenses

### Expense Tracking
- Add expenses with multiple split types
- Support for three split methods:
  - **Equal Split**: Divides expense equally among all participants
  - **Exact Amount Split**: Specify exact amount each person owes
  - **Percentage Split**: Divide by percentage shares
- Add expense descriptions, categories, and notes

### Balance Management
- Real-time balance calculation
- View who owes whom
- Track total amounts spent per person
- Simplified balance view showing net amounts

## 🔐 Security

- Password hashing with bcryptjs
- JWT authentication tokens
- Protected routes with middleware
- Input validation
- CORS enabled for frontend communication

## 🚀 Usage Flow

1. **Register/Login** - Create account or sign in
2. **Create a Group** - Add expense group name and description
3. **Add Members** - Invite friends to the group
4. **Add Expenses** - Log shared expenses with split types
5. **View Balances** - Check who owes whom
6. **Settle Up** - Track payments and clear debts

## 📝 Example Expense Split

**Scenario**: Three friends (Alice, Bob, Charlie) go to dinner costing $90

**Equal Split**: Each person owes $30
**Exact Split**: Alice owes $40, Bob owes $35, Charlie owes $15
**Percentage Split**: Alice 50%, Bob 30%, Charlie 20% = $45, $27, $18

## 🔧 Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/expense-sharing-app
JWT_SECRET=your_secret_key
NODE_ENV=development
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:5000/api
```

## 📚 Database Schema

### User
- name, email, password
- groups (references)
- timestamps

### Group
- name, description
- members (array of user references)
- createdBy (user reference)
- expenses (array of expense references)
- timestamps

### Expense
- description, amount, currency
- paidBy (user reference)
- group (group reference)
- splitType (equal/exact/percentage)
- splits (array of {user, amount})
- category, notes
- timestamps

### Balance
- group (group reference)
- user (user reference)
- owedBy (array of {user, amount})
- owedTo (array of {user, amount})
- timestamps

## 🐛 Troubleshooting

### Backend won't connect to MongoDB
- Ensure MongoDB is running
- Check MONGODB_URI in .env file
- Verify network connectivity

### Frontend can't reach backend
- Ensure backend is running on port 5000
- Check REACT_APP_API_URL in frontend .env
- Verify CORS is enabled in backend

### Authentication issues
- Clear browser localStorage
- Check JWT_SECRET is set
- Ensure token is being sent in request headers

## 📄 License

This project is created for educational purposes.

## 👥 Contributing

Feel free to fork and submit pull requests for improvements.

---

**Ready to split expenses? Get started now!** 💰
