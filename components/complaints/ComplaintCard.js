import Link from "next/link";
import StatusBadge from "@/components/ui/StatusBadge";

const priorityColors = {
  low: "text-gray-500",
  medium: "text-yellow-600",
  high: "text-red-600",
};

export default function ComplaintCard({ complaint }) {
  return (
    <Link href={`/complaints/${complaint._id}`}>
      <div className="card hover:shadow-md transition-shadow cursor-pointer">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 truncate">{complaint.title}</h3>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{complaint.description}</p>
          </div>
          <StatusBadge status={complaint.status} />
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
          <span className="bg-gray-100 px-2 py-1 rounded-full">{complaint.category?.name || "Uncategorized"}</span>
          <span className={`font-medium capitalize ${priorityColors[complaint.priority]}`}>
            {complaint.priority} priority
          </span>
          <span>{new Date(complaint.createdAt).toLocaleDateString()}</span>
          {complaint.assignedTo && (
            <span className="text-blue-600">→ {complaint.assignedTo.name}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
