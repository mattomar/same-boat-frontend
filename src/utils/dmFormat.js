export const displayName = (user) => {
  if (!user) return "Unknown user";
  const full = `${user.firstName || ""} ${user.lastName || ""}`.trim();
  return full || user.username || "Unknown user";
};

export const formatTimestamp = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toDateString() === new Date().toDateString()
    ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString([], { month: "short", day: "numeric" });
};

export const MAX_MESSAGE_LENGTH = 2000;
