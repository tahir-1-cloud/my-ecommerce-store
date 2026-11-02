
import React, { useState, useEffect } from "react";

const CustomSelect = ({ options = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);

  useEffect(() => {
    if (options.length > 0) {
      setSelectedOption((current) => {
        if (!current) return options[0];

        return (
          options.find((option) => option.value === current.value) ||
          options[0]
        );
      });
    }
  }, [options]);

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    setIsOpen(false);
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (!event.target.closest(".custom-select")) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div
      className="dropdown-content custom-select relative"
      style={{ width: "240px", maxWidth: "100%" }}
    >
      <div
        className={`select-selected whitespace-nowrap overflow-hidden text-ellipsis ${
          isOpen ? "select-arrow-active" : ""
        }`}
        title={selectedOption?.label || "All Categories"}
        onClick={toggleDropdown}
      >
        {selectedOption?.label || "All Categories"}
      </div>

      <div className={`select-items ${isOpen ? "" : "select-hide"}`}>
        {options.map((option) => (
          <div
            key={option.value}
            onClick={() => handleOptionClick(option)}
            className={`select-item ${
              selectedOption?.value === option.value
                ? "same-as-selected"
                : ""
            }`}
            title={option.label}
          >
            {option.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomSelect;
