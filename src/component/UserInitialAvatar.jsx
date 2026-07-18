import React from 'react';

export default function UserInitialAvatar({ targetName, targetHandle }) {
  const resolvedString = targetName || targetHandle || "A";
  const displayChar = resolvedString.charAt(0).toUpperCase();

  return (
    <div className="fc-avatar-initials">
      {displayChar}
    </div>
  );
}