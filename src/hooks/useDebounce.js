import { useState, useEffect } from 'react';

/**
 * useDebounce - Debounce a value
 * @param {*} value - Value to debounce
 * @param {number} delay - Delay in milliseconds (default: 500ms)
 * @returns {*} Debounced value
 */
const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set up the timeout to update the debounced value after the delay
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Clean up the timeout if value changes (also on component unmount)
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export default useDebounce;
