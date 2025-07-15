import React, { useState } from "react";

function ToogleButton({ onToggle, isActive }) {
  return (
    <div className="toggleButton">
      <label className="flex items-center relative w-max cursor-pointer select-none">
        <input
          type="checkbox"
          checked={isActive}
          onChange={onToggle}
          className="appearance-none ring-2 transition-colors cursor-pointer w-10 h-4 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black focus:ring-blue-500"
        />
        <span className="w-4 h-4 right-[23px] absolute rounded-full transform transition-transform bg-gray-200" />
      </label>
    </div>
  );
}

export default ToogleButton;