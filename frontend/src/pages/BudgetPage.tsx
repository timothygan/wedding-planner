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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Budget</h1>
        <p className="text-gray-600">Track your wedding expenses</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-lg p-4 border">
          <div className="text-sm text-gray-600">Estimated</div>
          <div className="text-2xl font-bold">{formatCurrency(totalEstimated)}</div>
        </div>
        <div className="bg-white rounded-lg p-4 border">
          <div className="text-sm text-gray-600">Actual</div>
          <div className="text-2xl font-bold">{formatCurrency(totalActual)}</div>
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
                  <div className="font-semibold">{formatCurrency(item.actual_amount)}</div>
                </div>
                <div>
                  <div className="text-gray-600">Paid</div>
                  <div className="font-semibold">{formatCurrency(item.paid_amount)}</div>
                </div>
              </div>

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

