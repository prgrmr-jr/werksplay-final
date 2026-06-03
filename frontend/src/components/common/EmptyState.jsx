export default function EmptyState({ message = 'Nothing here yet.' }) {
  return (
    <div className="text-center py-12 text-gray-500">{message}</div>
  )
}
