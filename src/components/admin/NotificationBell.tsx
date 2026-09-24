import Link from "next/link";

export function NotificationBell({ unreadCount }: { unreadCount: number }) {
  return (
    <Link
      href="/admin/consulting-requests"
      prefetch={false}
      className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200"
      aria-label={`읽지 않은 상담 신청 ${unreadCount}건`}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0"
          stroke="#334155"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {unreadCount > 0 && (
        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border border-white bg-red-500" />
      )}
    </Link>
  );
}
