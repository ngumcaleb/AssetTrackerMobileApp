export function getInitials(name?: string | null): string {
  if (!name?.trim()) return '??';
  return name
    .split(/\s+/)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatCurrency(value?: number | null): string {
  if (value == null) return 'N/A';
  return `${Number(value).toLocaleString()} FCFA`;
}

export function statusMeta(status: string) {
  switch (status) {
    case 'checked_out':
      return { label: 'Checked Out', color: '#d97706', bg: '#fef3c7', dot: '#f59e0b' };
    case 'archived':
      return { label: 'Archived', color: '#737686', bg: '#e7e7f3', dot: '#737686' };
    case 'discarded':
      return { label: 'Discarded', color: '#93000a', bg: '#ffdad6', dot: '#ba1a1a' };
    default:
      return { label: 'Active', color: '#16a34a', bg: '#e6f9e6', dot: '#22c55e' };
  }
}
