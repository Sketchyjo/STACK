# Transaction Components

This document describes the Transaction components available in the UI library.

## Components

### TransactionItem

A molecule component that displays individual transaction information.

#### Props

- `transaction: Transaction` - The transaction data to display
- `onPress?: (transaction: Transaction) => void` - Optional callback when transaction is pressed
- `className?: string` - Optional CSS class name

#### Features

- Displays transaction icon based on type
- Shows transaction description and formatted amount
- Color-coded amounts (green for deposits, red for expenses)
- Status indicators (pending, completed, etc.)
- Formatted date display
- Pressable when onPress is provided

#### Transaction Types Supported

- `CARD_PURCHASE` - Credit/debit card purchases
- `INVESTMENT` - Investment transactions
- `DEPOSIT` - Money deposits
- `WITHDRAWAL` - Money withdrawals
- `LOAN_DISBURSEMENT` - Loan disbursements
- `LOAN_REPAYMENT` - Loan repayments
- `ROUND_UP` - Round-up investments
- `TRANSFER` - Money transfers
- `FEE` - Service fees
- `REFUND` - Refunds

#### Transaction Statuses

- `PENDING` - Transaction is being processed
- `COMPLETED` - Transaction completed successfully
- `REVERSED` - Transaction was reversed/cancelled

### TransactionList

A molecule component that displays a list of transactions.

#### Props

- `transactions: Transaction[]` - Array of transactions to display
- `title?: string` - Optional title (defaults to "Recent Transactions")
- `emptyMessage?: string` - Optional empty state message (defaults to "No transactions yet")
- `onTransactionPress?: (transaction: Transaction) => void` - Optional callback when a transaction is pressed
- `className?: string` - Optional CSS class name

#### Features

- Displays list of transactions using TransactionItem
- Customizable title and empty state message
- Handles empty state gracefully
- Passes through onPress events to individual items
- Responsive design with proper spacing

## Usage Examples

### Basic Usage

```tsx
import { TransactionList } from '@stack/ui-library';

const MyComponent = () => {
  const transactions = [
    {
      id: '1',
      amount: 25.50,
      currency: 'USD',
      type: 'CARD_PURCHASE',
      status: 'COMPLETED',
      description: 'Coffee Shop Purchase',
      // ... other required fields
    },
  ];

  return (
    <TransactionList 
      transactions={transactions}
      title="Recent Transactions"
    />
  );
};
```

### With Press Handler

```tsx
import { TransactionList } from '@stack/ui-library';

const MyComponent = () => {
  const handleTransactionPress = (transaction) => {
    // Navigate to transaction details
    navigation.navigate('TransactionDetails', { id: transaction.id });
  };

  return (
    <TransactionList 
      transactions={transactions}
      onTransactionPress={handleTransactionPress}
    />
  );
};
```

### Custom Empty State

```tsx
import { TransactionList } from '@stack/ui-library';

const MyComponent = () => {
  return (
    <TransactionList 
      transactions={[]}
      title="Investment Transactions"
      emptyMessage="Start investing to see your transactions here"
    />
  );
};
```

## Data Structure

The Transaction type includes:

```typescript
interface Transaction {
  id: string;
  amount: number;
  currency: string;
  type: TransactionType;
  status: TransactionStatus;
  description: string | null;
  metadata: any;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}
```

## Design Integration

These components follow the design system specifications:

- Uses design tokens for colors, typography, and spacing
- Implements the card-based layout from design.json
- Supports the RecentTransactionsList component specified in the Card Hub screen
- Responsive design that works across different screen sizes

## Testing

Both components include comprehensive test suites covering:

- Rendering with different transaction types and statuses
- Press event handling
- Empty state display
- Custom props and styling
- Edge cases and error handling

Run tests with:

```bash
npm test -- --testPathPattern="Transaction"
```