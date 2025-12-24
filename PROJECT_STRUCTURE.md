# Project Structure Overview

## Complete Directory Tree

```
sharing_apll/
│
├── README.md                          # Project documentation
├── SETUP.md                          # Setup and run instructions
├── FEATURES.md                       # Detailed features & architecture
├── .gitignore                        # Git ignore patterns
├── start.sh                          # Linux/Mac startup script
├── start.bat                         # Windows startup script
│
├── backend/                          # Node.js & Express API Server
│   ├── package.json                  # Backend dependencies
│   ├── .env                          # Environment variables (create this)
│   ├── .env.example                  # Example env file
│   ├── server.js                     # Express server entry point
│   │
│   ├── models/                       # MongoDB Schemas
│   │   ├── User.js                   # User schema with password hashing
│   │   ├── Group.js                  # Group schema with members
│   │   ├── Expense.js                # Expense schema with splits
│   │   └── Balance.js                # Balance tracking schema
│   │
│   ├── controllers/                  # Business Logic
│   │   ├── userController.js         # Register, login, user retrieval
│   │   ├── groupController.js        # Group CRUD operations
│   │   ├── expenseController.js      # Expense CRUD & split logic
│   │   └── balanceController.js      # Balance calculation & retrieval
│   │
│   ├── routes/                       # API Endpoints
│   │   ├── userRoutes.js             # /api/users endpoints
│   │   ├── groupRoutes.js            # /api/groups endpoints
│   │   ├── expenseRoutes.js          # /api/expenses endpoints
│   │   └── balanceRoutes.js          # /api/balances endpoints
│   │
│   ├── middleware/                   # Middleware Functions
│   │   └── auth.js                   # JWT authentication middleware
│   │
│   └── utils/                        # Helper Functions
│       ├── splitCalculator.js        # Split calculation logic
│       └── balanceCalculator.js      # Balance calculation logic
│
└── frontend/                         # React Application
    ├── package.json                  # Frontend dependencies
    ├── .env.example                  # Example env file
    │
    ├── public/                       # Static files
    │   └── index.html                # HTML entry point
    │
    └── src/                          # React source code
        ├── App.js                    # Main App component with routing
        ├── App.css                   # App styles
        ├── index.js                  # React DOM render
        ├── index.css                 # Global styles
        │
        ├── context/                  # React Context Providers
        │   └── AuthContext.js        # Authentication state management
        │
        ├── pages/                    # Page Components
        │   ├── Login.js              # Login page
        │   ├── Register.js           # Registration page
        │   ├── Groups.js             # Groups list & creation
        │   └── GroupDetail.js        # Group details with expenses/balances
        │
        ├── components/               # Reusable Components
        │   ├── Navigation.js         # Top navigation bar
        │   └── ProtectedRoute.js     # Protected route wrapper
        │
        ├── api/                      # API Communication
        │   └── axios.js              # Axios instance with interceptors
        │
        └── styles/                   # CSS Stylesheets
            ├── index.css             # Base styles
            ├── Auth.css              # Login/Register styles
            ├── Navigation.css        # Navigation styles
            ├── Groups.css            # Groups page styles
            ├── GroupDetail.css       # Group detail page styles
            └── App.css               # App container styles
```

## File Descriptions

### Backend Files

#### Core Files
- **server.js** - Express server initialization, middleware setup, routes mounting, MongoDB connection
- **package.json** - Node dependencies (express, mongoose, cors, jwt, bcryptjs)
- **.env** - Environment variables (PORT, MONGODB_URI, JWT_SECRET, NODE_ENV)

#### Models (Database Schemas)
- **User.js** - User data structure, password hashing, password comparison methods
- **Group.js** - Group data, member references, expense tracking
- **Expense.js** - Expense details, payer info, split information
- **Balance.js** - Balance data per user per group, debt tracking

#### Controllers (Business Logic)
- **userController.js**
  - `registerUser()` - Create new user account
  - `loginUser()` - Authenticate and issue JWT
  - `getCurrentUser()` - Get logged-in user details
  - `getUserById()` - Get specific user info

- **groupController.js**
  - `createGroup()` - Create new expense group
  - `getUserGroups()` - Get all user's groups
  - `getGroupById()` - Get group with members and expenses
  - `addMemberToGroup()` - Add user to group
  - `deleteGroup()` - Delete group (creator only)

- **expenseController.js**
  - `createExpense()` - Add expense to group with splits
  - `getGroupExpenses()` - Get all expenses for group
  - `getExpenseById()` - Get single expense details
  - `deleteExpense()` - Delete expense (payer only)

- **balanceController.js**
  - `getGroupBalances()` - Get all user balances in group
  - `getUserBalance()` - Get specific user balance

#### Routes (API Endpoints)
- **userRoutes.js** - `/api/users/*` endpoints (register, login, get user)
- **groupRoutes.js** - `/api/groups/*` endpoints (CRUD groups, manage members)
- **expenseRoutes.js** - `/api/expenses/*` endpoints (CRUD expenses)
- **balanceRoutes.js** - `/api/balances/*` endpoints (get balances)

#### Middleware
- **auth.js** - JWT verification, user authentication for protected routes

#### Utils
- **splitCalculator.js**
  - `calculateEqualSplit()` - Equal division algorithm
  - `calculateExactSplit()` - Exact amount validation
  - `calculatePercentageSplit()` - Percentage division
  - `distributeSplits()` - Main split distribution logic

- **balanceCalculator.js**
  - `calculateGroupBalances()` - Calculate all group balances

### Frontend Files

#### Core Files
- **App.js** - Main App component with routing, auth check, route protection
- **index.js** - React entry point, AuthProvider wrapper
- **App.css** - App container styles

#### Pages
- **Login.js**
  - Login form with email/password
  - Submit to API and store token
  - Redirect on success

- **Register.js**
  - Registration form with name/email/password
  - Create account and auto-login
  - Redirect to groups

- **Groups.js**
  - Display all user's groups in grid
  - Create new group form
  - Navigate to group details

- **GroupDetail.js**
  - Tabbed interface (Expenses, Balances, Members)
  - Expense list with add form
  - Balance summary and breakdown
  - Member list display

#### Components
- **Navigation.js** - Top navbar with user info and logout
- **ProtectedRoute.js** - Route wrapper requiring authentication

#### Context
- **AuthContext.js**
  - `useAuth()` hook for auth state
  - `login()` - Set user and token
  - `logout()` - Clear auth state
  - localStorage persistence

#### API
- **axios.js**
  - Base axios instance with API URL
  - Request interceptor to add JWT token
  - API helper functions:
    - `authAPI.register/login/getCurrentUser`
    - `groupAPI.createGroup/getGroupById/etc`
    - `expenseAPI.createExpense/getGroupExpenses/etc`
    - `balanceAPI.getGroupBalances/getUserBalance`

#### Styles
- **index.css** - Global styles, base components
- **Auth.css** - Login/Register page styling
- **Navigation.css** - Navigation bar styling
- **Groups.css** - Groups page grid and cards
- **GroupDetail.css** - Tabs, forms, balance cards, expense lists
- **App.css** - App container styles

## Data Flow Examples

### User Registration Flow
```
Frontend: Register.js
  ↓
User fills form and submits
  ↓
API: authAPI.register(name, email, password)
  ↓
Backend: POST /api/users/register
  ↓
Controller: userController.registerUser()
  ↓
Model: Create new User document
  ↓
Database: Store user in MongoDB
  ↓
Response: Success message
  ↓
Frontend: Auto-login and redirect to /groups
```

### Create Expense Flow
```
Frontend: GroupDetail.js (Expense Form)
  ↓
User fills expense details and select split type
  ↓
API: expenseAPI.createExpense(...)
  ↓
Backend: POST /api/expenses
  ↓
Middleware: Verify JWT token
  ↓
Controller: expenseController.createExpense()
  ↓
Utils: splitCalculator.distributeSplits()
  ↓
Model: Create Expense document with calculated splits
  ↓
Group: Update group's expenses array
  ↓
Database: Store expense in MongoDB
  ↓
Response: Created expense with populated references
  ↓
Frontend: Update local state and re-render
  ↓
Fetch updated balances
```

### Get Balances Flow
```
Frontend: GroupDetail.js (Balances Tab)
  ↓
API: balanceAPI.getGroupBalances(groupId)
  ↓
Backend: GET /api/balances/group/:groupId
  ↓
Middleware: Verify JWT and group membership
  ↓
Controller: balanceController.getGroupBalances()
  ↓
Fetch all group expenses
  ↓
Utils: calculateGroupBalances(expenses)
  ↓
Format balance data
  ↓
Response: Detailed balance information
  ↓
Frontend: Display balance cards and summary
```

## Technology Stack Summary

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js (web framework)
- **Database**: MongoDB with Mongoose (ODM)
- **Authentication**: JWT (jsonwebtoken)
- **Security**: bcryptjs (password hashing)
- **CORS**: cors (cross-origin requests)
- **Development**: nodemon (auto-reload)

### Frontend
- **Library**: React (UI)
- **Routing**: React Router v6
- **HTTP Client**: Axios (API calls)
- **Styling**: CSS3 (Grid, Flexbox)
- **State Management**: Context API

### Development
- **Package Manager**: npm
- **Version Control**: Git/GitHub
- **Scripting**: PowerShell (Windows), Bash (Unix)

---

**This structure ensures clean separation of concerns, scalability, and maintainability!** 📁
