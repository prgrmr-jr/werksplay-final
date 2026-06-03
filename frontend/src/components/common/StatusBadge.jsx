export default function StatusBadge({status = ""}) {
    const normalized = String(status)
        .trim()
        .toLowerCase();

    const map = {
        pending: "badge-pending",
        approved: "badge-approved",
        declined: "badge-declined",
        "completion pending": "badge-completion-pending",
        completed: "badge-completed",
    };

    const labelMap = {
        pending: "PENDING",
        approved: "APPROVED",
        declined: "DECLINED",
        "completion pending": "COMPLETION PENDING",
        completed: "COMPLETED",
    };

    return (
        <span className={map[normalized] ?? "badge-pending"}>
      {labelMap[normalized] ?? "PENDING"}
    </span>
    );
}