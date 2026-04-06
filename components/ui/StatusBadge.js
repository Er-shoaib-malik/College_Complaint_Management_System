export default function StatusBadge({ status }) {
  const labels = {
    pending: "Pending",
    assigned: "Assigned",
    in_progress: "In Progress",
    resolved: "Resolved",
    closed: "Closed",
  };
  return (
    <span className={`badge-${status}`}>
      {labels[status] || status}
    </span>
  );
}
