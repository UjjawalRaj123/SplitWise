# Expense Sharing Application - Features & Architecture

## 🎯 Key Features Implementation

### 1. User Authentication & Authorization

**Features:**
- User registration with email and password
- Secure login with JWT tokens
- Password hashing with bcryptjs
- Protected routes and API endpoints
- Session persistence using localStorage

**Files:**
- `backend/controllers/userController.js` - Auth logic
- `backend/middleware/auth.js` - JWT verification
- `frontend/context/AuthContext.js` - Auth state management
- `frontend/pages/Login.js` & `Register.js` - Auth UI

### 2. Group Management

**Features:**
- Create expense groups
- Add group members
- View group details
- Track group expenses
- Delete groups (creator only)

**Implementation:**
```javascript
// Group creation with members
groupAPI.createGroup(name, description, memberIds)

// Members are managed as array of user references
// Creator is automatically added as first member
// Other members can be added after creation
```

**Files:**
- `backend/models/Group.js` - Group schema
- `backend/controllers/groupController.js` - Group logic
- `frontend/pages/Groups.js` - Groups list & creation

### 3. Expense Management

**Features:**
- Add expenses to groups
- Flexible expense splitting (3 types)
- Track who paid for what
- Add expense details (category, notes)
- Delete expenses (payer only)

**Split Types:**

#### Equal Split
```javascript
// Divides expense equally among all group members
amount = 90, members = 3
Each person owes: 90 / 3 = $30
```

#### Exact Amount Split
```javascript
// Specify exact amount each person owes
splits = [
  { user: Alice, amount: 40 },
  { user: Bob, amount: 35 },
  { user: Charlie, amount: 15 }
]
```

#### Percentage Split
```javascript
// Divide by percentage shares
amount = 100
percentages = [
  { user: Alice, percentage: 50 },
  { user: Bob, percentage: 30 },
  { user: Charlie, percentage: 20 }
]
Results: Alice=$50, Bob=$30, Charlie=$20
```

**Files:**
- `backend/models/Expense.js` - Expense schema
- `backend/controllers/expenseController.js` - Expense logic
- `backend/utils/splitCalculator.js` - Split calculations
- `frontend/pages/GroupDetail.js` - Expense UI

### 4. Balance Tracking

**Features:**
- Automatic balance calculation
- View who owes whom
- Track total amounts spent
- Simplified net balance view
- Real-time updates

**Balance Calculation Algorithm:**

1. **Process all expenses in group**
   - For each expense, track who paid (creditor)
   - Track who owes what (debtors)

2. **Calculate per-person balance**
   - Total amount paid by person
   - Total amount owed to person
   - Detailed breakdown of debts

3. **User perspective**
   - How much they owe (total)
   - How much others owe them (total)
   - Net balance (positive = owed to them, negative = they owe)

**Example:**
```
Expense 1: Alice paid $90 (split equally between 3)
  Alice paid: $90, owes: $30 (net: +$60)
  Bob owes: $30
  Charlie owes: $30

Summary:
- Alice: Total paid $90, Total owes $0, Net +$90
- Bob: Total paid $0, Total owes $30, Net -$30
- Charlie: Total paid $0, Total owes $30, Net -$30
```

**Files:**
- `backend/models/Balance.js` - Balance schema
- `backend/controllers/balanceController.js` - Balance logic
- `backend/utils/balanceCalculator.js` - Balance calculations
- `frontend/pages/GroupDetail.js` - Balance display

### 5. User Interface

**Components:**

#### Navigation
- User menu with logout
- Group navigation
- Responsive header

#### Authentication Pages
- Login form with validation
- Registration form with validation
- Error handling and feedback

#### Group Management
- Groups grid/list view
- Group creation form
- Group detail view with tabs

#### Expense Tracking
- Expense list with details
- Expense creation form
- Split type selector
- Category and notes support

#### Balance Management
- User balance summary
- Detailed balance cards
- Who owes whom breakdown
- Visual balance indicators

**Styling:**
- Modern CSS with flexbox/grid
- Responsive design for mobile
- Color-coded balance indicators
- Smooth transitions and interactions

## 🔧 Technical Architecture

### Backend Architecture

```
Request → Router → Middleware (Auth) → Controller → Service/Utils → Model → Database
Response ← Controller ← Database Query
```

**Flow Example - Create Expense:**
1. POST `/api/expenses` with expense data
2. Authenticate middleware verifies JWT
3. expenseController.createExpense called
4. splitCalculator.distributeSplits calculates splits
5. Expense model saved to MongoDB
6. Group model updated with new expense
7. Response sent to frontend

### Frontend Architecture

```
User Input → Component → API Call → State Update → Re-render
```

**Data Flow:**
- AuthContext manages user auth state
- Components use useAuth hook for auth
- API calls via axios with token injection
- State updates trigger re-renders
- Protected routes redirect unauthenticated users

## 📊 Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  groups: [ObjectId], // References to Group documents
  createdAt: Date,
  updatedAt: Date
}
```

### Group Collection
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  members: [ObjectId], // References to User documents
  createdBy: ObjectId, // Reference to User
  expenses: [ObjectId], // References to Expense documents
  createdAt: Date,
  updatedAt: Date
}
```

### Expense Collection
```javascript
{
  _id: ObjectId,
  description: String,
  amount: Number,
  currency: String (default: "USD"),
  paidBy: ObjectId, // Reference to User
  group: ObjectId, // Reference to Group
  splitType: String (enum: equal/exact/percentage),
  splits: [
    {
      user: ObjectId, // Reference to User
      amount: Number
    }
  ],
  category: String,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Balance Collection
```javascript
{
  _id: ObjectId,
  group: ObjectId, // Reference to Group
  user: ObjectId, // Reference to User
  owedBy: [
    {
      user: ObjectId,
      amount: Number
    }
  ],
  owedTo: [
    {
      user: ObjectId,
      amount: Number
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

## 🔐 Security Features

1. **Password Security**
   - Bcryptjs hashing with salt rounds
   - Never store plain passwords
   - Compare hashed passwords during login

2. **Authentication**
   - JWT tokens with expiration (7 days)
   - Token stored in localStorage
   - Interceptor adds token to all requests

3. **Authorization**
   - Protected routes check authentication
   - API endpoints verify JWT
   - Users can only access their own data
   - Group creators can delete groups
   - Expense payers can delete expenses

4. **Data Validation**
   - Input validation on backend
   - Type checking with Mongoose schemas
   - Error handling and appropriate status codes

## 📈 Scalability Considerations

**Current Implementation:**
- Suitable for small to medium groups
- Real-time balance recalculation on each expense

**Future Improvements:**
- Cache balance calculations
- Implement pagination for expenses
- Add search and filter functionality
- Archive old expenses
- Bulk operations for settling

## 🧪 Testing Scenarios

### Scenario 1: Simple Equal Split
1. Create group with 3 members (Alice, Bob, Charlie)
2. Alice pays $90 for dinner (equal split)
3. Check balances:
   - Bob owes Alice $30
   - Charlie owes Alice $30

### Scenario 2: Mixed Splits
1. Create group with 3 members
2. Alice pays $60 (exact: Alice $20, Bob $20, Charlie $20)
3. Bob pays $30 (percentage: Alice 50%, Bob 30%, Charlie 20%)
4. Verify combined balances

### Scenario 3: Complex Group
1. Create group with multiple members
2. Multiple expenses with different split types
3. Verify balance calculations are correct
4. Check user perspective vs global perspective

## 📝 API Response Examples

### Create Expense Response
```json
{
  "message": "Expense created successfully",
  "expense": {
    "_id": "507f1f77bcf86cd799439011",
    "description": "Dinner",
    "amount": 90,
    "paidBy": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "Alice",
      "email": "alice@example.com"
    },
    "splitType": "equal",
    "splits": [
      {
        "user": {
          "_id": "507f1f77bcf86cd799439013",
          "name": "Bob"
        },
        "amount": 30
      }
    ]
  }
}
```

### Get Balances Response
```json
{
  "groupId": "507f1f77bcf86cd799439011",
  "balances": [
    {
      "userId": "507f1f77bcf86cd799439012",
      "userName": "Alice",
      "totalSpent": 90,
      "totalOwed": 0,
      "owedBy": []
    },
    {
      "userId": "507f1f77bcf86cd799439013",
      "userName": "Bob",
      "totalSpent": 0,
      "totalOwed": 30,
      "owedBy": [
        {
          "userId": "507f1f77bcf86cd799439012",
          "userName": "Alice",
          "amount": 30
        }
      ]
    }
  ],
  "userSummary": {
    "userId": "507f1f77bcf86cd799439012",
    "totalOwes": 0,
    "totalIsOwed": 60,
    "netBalance": 60
  }
}
```

---

**This architecture provides a solid foundation for expense sharing with room for future enhancements!** 🚀
