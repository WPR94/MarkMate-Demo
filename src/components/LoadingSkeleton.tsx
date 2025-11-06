// Reusable loading skeleton components for better UX

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow p-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
          <div className="h-8 bg-gray-300 rounded w-16"></div>
        </div>
        <div className="bg-gray-200 rounded-full p-3 w-14 h-14"></div>
      </div>
    </div>
  );
}

export function ListItemSkeleton() {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg animate-pulse">
      <div className="flex-1">
        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
      </div>
      <div className="w-5 h-5 bg-gray-200 rounded"></div>
    </div>
  );
}

export function TableRowSkeleton() {
  return (
    <tr className="animate-pulse">
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-32"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-24"></div>
      </td>
      <td className="px-6 py-4">
        <div className="h-4 bg-gray-200 rounded w-20"></div>
      </td>
      <td className="px-6 py-4">
        <div className="flex gap-2">
          <div className="h-8 bg-gray-200 rounded w-16"></div>
          <div className="h-8 bg-gray-200 rounded w-16"></div>
        </div>
      </td>
    </tr>
  );
}

export function ChartSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow p-6 animate-pulse">
      <div className="h-5 bg-gray-200 rounded w-40 mb-4"></div>
      <div className="h-64 bg-gray-100 rounded flex items-end justify-around p-4 gap-2">
        <div className="bg-gray-200 rounded w-full h-5/6"></div>
        <div className="bg-gray-200 rounded w-full h-4/6"></div>
        <div className="bg-gray-200 rounded w-full h-full"></div>
        <div className="bg-gray-200 rounded w-full h-3/6"></div>
        <div className="bg-gray-200 rounded w-full h-5/6"></div>
        <div className="bg-gray-200 rounded w-full h-4/6"></div>
      </div>
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow p-6 space-y-4 animate-pulse">
      <div>
        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
        <div className="h-10 bg-gray-100 rounded w-full"></div>
      </div>
      <div>
        <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
        <div className="h-32 bg-gray-100 rounded w-full"></div>
      </div>
      <div className="flex gap-3">
        <div className="h-10 bg-gray-200 rounded w-24"></div>
        <div className="h-10 bg-gray-200 rounded w-24"></div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
      
      {/* Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
      
      {/* Recent Activity Skeleton */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200 animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-40"></div>
        </div>
        <div className="p-6 space-y-3">
          <ListItemSkeleton />
          <ListItemSkeleton />
          <ListItemSkeleton />
        </div>
      </div>
    </div>
  );
}
