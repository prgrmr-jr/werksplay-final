const colors = {
  Pending: 'bg-yellow-900 text-yellow-300',
  Approved: 'bg-green-900 text-green-300',
  Declined: 'bg-red-900 text-red-300',
  Completed: 'bg-purple-900 text-purple-300',
}

export default function Badge({ status }) {
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${colors[status] || 'bg-gray-700 text-gray-300'}`}>
      {status}
    </span>
  )
}
