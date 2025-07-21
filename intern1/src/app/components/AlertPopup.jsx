import React from "react";

/**
 * AlertPopup component for showing alert messages.
 * @param {boolean} show - Whether to show the alert
 * @param {string} message - The alert message
 * @param {string} positionClass - Additional classes for positioning (e.g., 'absolute bottom-0 right-0')
 */
const AlertPopup = ({ show, message, positionClass = "" }) => {
  if (!show) return null;
  return (
    <div className={`${positionClass} z-40 flex justify-center items-center`}>
      <p className="w-56 min-h-16 max-h-32 p-2 flex justify-center items-center text-center rounded-lg text-base text-white bg-black shadow-lg border-2 border-slate-400 overflow-hidden break-words">
        {message}
      </p>
    </div>
  );
};

export default AlertPopup; 