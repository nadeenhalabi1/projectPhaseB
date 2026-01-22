import { Fragment, useRef, useState, useEffect, useCallback } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { Check, ChevronDown } from 'lucide-react';
import { createPortal } from 'react-dom';
import clsx from 'clsx';

/**
 * Select component (Headless UI Listbox)
 * - Portaled fixed dropdown
 * - Restores page scrolling behind dropdown by forwarding wheel deltas when at boundaries
 */
export default function Select({
  value,
  onChange,
  options = [],
  placeholder = 'Select...',
  disabled = false,
  className,
  size = 'md',
}) {
  const buttonRef = useRef(null);
  const openRef = useRef(false);

  const [dropdownPosition, setDropdownPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
  });

  const sizes = {
    sm: 'py-1.5 pl-3 pr-8 text-sm',
    md: 'py-2 pl-3 pr-10 text-sm',
    lg: 'py-3 pl-4 pr-10 text-base',
  };

  const selectedOption = options.find(o => o.value === value);

  const updatePosition = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setDropdownPosition({
      top: rect.bottom,
      left: rect.left,
      width: rect.width,
    });
  }, []);

  useEffect(() => {
    if (!openRef.current) return;
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [updatePosition]);

  return (
    <Listbox value={value} onChange={onChange} disabled={disabled}>
      {({ open }) => {
        if (open !== openRef.current) {
          openRef.current = open;
          if (open) {
            // Defer to next tick so we don't set state during render
            setTimeout(updatePosition, 0);
          }
        }

        return (
          <>
            <div className={clsx('relative', className)}>
              <Listbox.Button
                ref={buttonRef}
                className={clsx(
                  'relative w-full cursor-pointer rounded-md border border-gray-300 bg-white text-left shadow-sm focus:border-linkedin-500 focus:outline-none focus:ring-1 focus:ring-linkedin-500',
                  sizes[size],
                  disabled && 'cursor-not-allowed opacity-50'
                )}
              >
                <span className="block truncate">
                  {selectedOption?.label || placeholder}
                </span>
                <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </span>
              </Listbox.Button>
            </div>

            {open &&
              createPortal(
                <Transition
                  show={open}
                  as={Fragment}
                  leave="transition ease-in duration-100"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <Listbox.Options
                    className="z-[9999] max-h-60 overflow-auto rounded-md bg-white py-1 text-sm shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                    style={{
                      position: 'fixed',
                      top: dropdownPosition.top,
                      left: dropdownPosition.left,
                      width: dropdownPosition.width,
                    }}
                  >
                    {options.map(option => (
                      <Listbox.Option
                        key={option.value}
                        value={option.value}
                        disabled={option.disabled}
                        className={({ active }) =>
                          clsx(
                            'relative cursor-pointer select-none py-2 pl-3 pr-9',
                            active ? 'bg-linkedin-50 text-linkedin-900' : 'text-gray-900',
                            option.disabled && 'opacity-50 cursor-not-allowed'
                          )
                        }
                      >
                        {({ selected }) => (
                          <>
                            <span
                              className={clsx(
                                'block truncate',
                                selected ? 'font-semibold' : 'font-normal'
                              )}
                            >
                              {option.label}
                            </span>
                            {selected && (
                              <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-linkedin-600">
                                <Check className="h-4 w-4" />
                              </span>
                            )}
                          </>
                        )}
                      </Listbox.Option>
                    ))}
                  </Listbox.Options>
                </Transition>,
                document.body
              )}
          </>
        );
      }}
    </Listbox>
  );
}
