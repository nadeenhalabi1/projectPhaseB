import clsx from 'clsx';
import { ChevronDown, ChevronUp } from 'lucide-react';

/**
 * Table component
 * Reusable table with sorting capabilities
 */
export function Table({ children, className }) {
  return (
    <div className="overflow-x-auto">
      <table className={clsx('min-w-full divide-y divide-gray-200', className)}>
        {children}
      </table>
    </div>
  );
}

export function TableHead({ children, className }) {
  return (
    <thead className={clsx('bg-gray-50', className)}>
      {children}
    </thead>
  );
}

export function TableBody({ children, className }) {
  return (
    <tbody className={clsx('bg-white divide-y divide-gray-200', className)}>
      {children}
    </tbody>
  );
}

export function TableRow({ children, onClick, className, highlight = false }) {
  return (
    <tr
      onClick={onClick}
      className={clsx(
        onClick && 'cursor-pointer hover:bg-gray-50 transition-colors',
        highlight && 'bg-linkedin-50 hover:bg-linkedin-100',
        className
      )}
    >
      {children}
    </tr>
  );
}

export function TableHeader({ children, sortable, sortDirection, onSort, className }) {
  return (
    <th
      onClick={sortable ? onSort : undefined}
      className={clsx(
        'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
        sortable && 'cursor-pointer hover:bg-gray-100 select-none',
        className
      )}
    >
      <div className="flex items-center gap-2">
        {children}
        {sortable && (
          <div className="flex flex-col">
            {sortDirection === 'asc' ? (
              <ChevronUp className="h-3 w-3" />
            ) : sortDirection === 'desc' ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <div className="h-3 w-3" />
            )}
          </div>
        )}
      </div>
    </th>
  );
}

export function TableCell({ children, className }) {
  return (
    <td className={clsx('px-6 py-4 whitespace-nowrap text-sm', className)}>
      {children}
    </td>
  );
}

// Default export with sub-components
Table.Head = TableHead;
Table.Body = TableBody;
Table.Row = TableRow;
Table.Header = TableHeader;
Table.Cell = TableCell;

export default Table;
