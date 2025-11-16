import { useBudgetItems, useDeleteBudgetItem } from '../hooks/useBudgetItems';
import type { BudgetItem } from '../types/budget';

export default function BudgetPage() {
  const { data: items, isLoading, error } = useBudgetItems();
  const { mutate: deleteItem } = useDeleteBudgetItem();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading budget items...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">
          Error loading budget items: {error instanceof Error ? error.message : 'Unknown error'}
        </div>
      </div>
    );
  }

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(cents / 100);
  };

  const getPaymentStatusColor = (status: BudgetItem['payment_status']) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'partially_paid':
        return 'bg-yellow-100 text-yellow-800';
      case 'deposit_paid':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate totals
  const totalEstimated = items?.reduce((sum, item) => sum + item.estimated_amount, 0) || 0;
  const totalActual = items?.reduce((sum, item) => sum + item.actual_amount, 0) || 0;
  const totalPaid = items?.reduce((sum, item) => sum + item.paid_amount, 0) || 0;

  // Calculate budget alerts
  const overBudgetItems = items?.filter(
    (item) => item.actual_amount > 0 && item.actual_amount > item.estimated_amount
  ) || [];
  const overBudgetTotal = overBudgetItems.reduce(
    (sum, item) => sum + (item.actual_amount - item.estimated_amount),
    0
  );
  const isOverBudget = totalActual > totalEstimated;

  // Payment due date reminders
  const upcomingPayments = items?.filter((item) => {
    if (!item.deposit_due_date && !item.final_payment_due_date) return false;
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    
    if (item.deposit_due_date) {
      const depositDate = new Date(item.deposit_due_date);
      if (depositDate >= now && depositDate <= thirtyDaysFromNow && item.payment_status === 'unpaid') {
        return true;
      }
    }
    
    if (item.final_payment_due_date) {
      const finalDate = new Date(item.final_payment_due_date);
      if (finalDate >= now && finalDate <= thirtyDaysFromNow && item.payment_status !== 'paid') {
        return true;
      }
    }
    
    return false;
  }) || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Budget</h1>
        <p className="text-gray-600">Track your wedding expenses</p>
      </div>

      {/* Payment Due Date Reminders */}
      {upcomingPayments.length > 0 && (
        <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <span className="text-2xl">⏰</span>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-lg font-semibold text-yellow-800">Upcoming Payment Due Dates</h3>
              <p className="text-yellow-700 mt-1">
                You have {upcomingPayments.length} payment{upcomingPayments.length !== 1 ? 's' : ''} due in the next 30 days.
              </p>
              <ul className="mt-3 space-y-2">
                {upcomingPayments.map((item) => (
                  <li key={item.id} className="text-sm text-yellow-700">
                    <div className="font-medium">{item.category}</div>
                    {item.deposit_due_date && item.payment_status === 'unpaid' && (
                      <div>
                        Deposit due: {new Date(item.deposit_due_date).toLocaleDateString()} -{' '}
                        {formatCurrency(item.deposit_amount || 0)}
                      </div>
                    )}
                    {item.final_payment_due_date && item.payment_status !== 'paid' && (
                      <div>
                        Final payment due: {new Date(item.final_payment_due_date).toLocaleDateString()} -{' '}
                        {formatCurrency(item.actual_amount - item.paid_amount)}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Budget Alerts */}
      {isOverBudget && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <span className="text-2xl">⚠️</span>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-lg font-semibold text-red-800">Over Budget Alert</h3>
              <p className="text-red-700 mt-1">
                Your actual spending ({formatCurrency(totalActual)}) exceeds your estimated budget (
                {formatCurrency(totalEstimated)}) by{' '}
                <span className="font-bold">{formatCurrency(totalActual - totalEstimated)}</span>.
              </p>
              {overBudgetItems.length > 0 && (
                <div className="mt-3">
                  <p className="text-sm font-medium text-red-800">
                    Items over budget ({overBudgetItems.length}):
                  </p>
                  <ul className="mt-2 space-y-1">
                    {overBudgetItems.map((item) => (
                      <li key={item.id} className="text-sm text-red-700">
                        • {item.category}: {formatCurrency(item.estimated_amount)} estimated →{' '}
                        {formatCurrency(item.actual_amount)} actual (
                        {formatCurrency(item.actual_amount - item.estimated_amount)} over)
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className={`bg-white rounded-lg p-4 border ${isOverBudget ? 'border-red-300' : ''}`}>
          <div className="text-sm text-gray-600">Estimated</div>
          <div className={`text-2xl font-bold ${isOverBudget ? 'text-red-600' : ''}`}>
            {formatCurrency(totalEstimated)}
          </div>
        </div>
        <div className={`bg-white rounded-lg p-4 border ${isOverBudget ? 'border-red-300' : ''}`}>
          <div className="text-sm text-gray-600">Actual</div>
          <div className={`text-2xl font-bold ${isOverBudget ? 'text-red-600' : ''}`}>
            {formatCurrency(totalActual)}
          </div>
          {isOverBudget && (
            <div className="text-sm text-red-600 mt-1">
              {formatCurrency(totalActual - totalEstimated)} over
            </div>
          )}
        </div>
        <div className="bg-white rounded-lg p-4 border">
          <div className="text-sm text-gray-600">Paid</div>
          <div className="text-2xl font-bold">{formatCurrency(totalPaid)}</div>
        </div>
      </div>

      {items && items.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg mb-4">No budget items yet</p>
          <p className="text-gray-400">Add your first budget item to get started!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {items?.map((item) => (
            <div
              key={item.id}
              className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg capitalize">{item.category}</h3>
                  {item.notes && (
                    <p className="text-gray-600 text-sm mt-1">{item.notes}</p>
                  )}
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(
                    item.payment_status
                  )}`}
                >
                  {item.payment_status.replace('_', ' ')}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                <div>
                  <div className="text-gray-600">Estimated</div>
                  <div className="font-semibold">{formatCurrency(item.estimated_amount)}</div>
                </div>
                <div>
                  <div className="text-gray-600">Actual</div>
                  <div
                    className={`font-semibold ${
                      item.actual_amount > item.estimated_amount ? 'text-red-600' : ''
                    }`}
                  >
                    {formatCurrency(item.actual_amount)}
                    {item.actual_amount > item.estimated_amount && (
                      <span className="text-xs text-red-600 block">
                        {formatCurrency(item.actual_amount - item.estimated_amount)} over
                      </span>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-gray-600">Paid</div>
                  <div className="font-semibold">
                    {formatCurrency(item.paid_amount)}
                    {item.actual_amount > 0 && (
                      <span className="text-xs text-gray-500 block">
                        {Math.round((item.paid_amount / item.actual_amount) * 100)}% paid
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Status Progress Bar */}
              {item.actual_amount > 0 && (
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Payment Progress</span>
                    <span>
                      {formatCurrency(item.paid_amount)} / {formatCurrency(item.actual_amount)}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        item.payment_status === 'paid'
                          ? 'bg-green-500'
                          : item.payment_status === 'partially_paid'
                          ? 'bg-yellow-500'
                          : item.payment_status === 'deposit_paid'
                          ? 'bg-blue-500'
                          : 'bg-gray-400'
                      }`}
                      style={{
                        width: `${Math.min((item.paid_amount / item.actual_amount) * 100, 100)}%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}

              {item.deposit_due_date && (
                <div className="mt-2 text-sm text-gray-600">
                  Deposit due: {new Date(item.deposit_due_date).toLocaleDateString()}
                </div>
              )}

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => deleteItem(item.id)}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

