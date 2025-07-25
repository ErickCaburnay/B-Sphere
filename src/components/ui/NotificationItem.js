import React from 'react';

export default function NotificationItem({ notification, onClick }) {
  const isUnread = !notification.read;

  // Helper to uppercase resident name at the start of the title
  function uppercaseResidentName(title) {
    if (!title) return '';
    // Try to uppercase up to the first 'requested' or the first space
    const requestedIdx = title.toLowerCase().indexOf('requested');
    if (requestedIdx > 0) {
      const namePart = title.slice(0, requestedIdx).trim().toUpperCase();
      return namePart + title.slice(requestedIdx);
    }
    // Otherwise, uppercase up to the first space (for short titles)
    const firstSpace = title.indexOf(' ');
    if (firstSpace > 0) {
      return title.slice(0, firstSpace).toUpperCase() + title.slice(firstSpace);
    }
    return title.toUpperCase();
  }

  return (
    <div
      className={`
        p-4 flex gap-3 items-center cursor-pointer transition rounded-lg
        ${isUnread
          ? 'bg-blue-50 text-gray-900 font-semibold border-l-4 border-blue-500'
          : 'bg-gray-50 text-gray-400 font-normal opacity-70'}
        hover:bg-blue-100
      `}
      onClick={onClick}
    >
      {/* Dot indicator for unread */}
      {isUnread && <span className="text-blue-500 mr-2 text-lg">🔵</span>}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="truncate">{uppercaseResidentName(notification.title)}</span>
        </div>
        <div className="text-xs mt-1 truncate">{notification.message}</div>
        <div className="text-xs mt-1">{notification.createdAt && new Date(notification.createdAt).toLocaleString()}</div>
      </div>
    </div>
  );
} 