import { useMemo, useState } from 'react';
import StatusPill from './StatusPill.jsx';

const getValue = (row, key) =>
  key.split('.').reduce((current, segment) => (current ? current[segment] : undefined), row);

const normalizeValue = (value) => {
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    return value.toLowerCase();
  }
  if (value instanceof Date) {
    return value.getTime();
  }
  return String(value).toLowerCase();
};

const compareValues = (left, right) => {
  if (left === right) {
    return 0;
  }
  if (left === '' || left === null || left === undefined) {
    return 1;
  }
  if (right === '' || right === null || right === undefined) {
    return -1;
  }
  return left > right ? 1 : -1;
};

export default function DataTable({
  title,
  description,
  columns,
  rows = [],
  getRowClassName,
  emptyMessage = 'Không có dữ liệu',
  searchable = false,
  searchKeys,
  searchPlaceholder = 'Tìm trong bảng...',
  initialSortKey = null,
  initialSortDirection = 'asc'
}) {
  const [query, setQuery] = useState('');
  const [sortConfig, setSortConfig] = useState({
    key: initialSortKey,
    direction: initialSortDirection
  });

  const resolvedSearchKeys = useMemo(() => {
    if (Array.isArray(searchKeys) && searchKeys.length > 0) {
      return searchKeys;
    }

    return columns
      .filter((column) => column.key && column.key !== 'actions')
      .map((column) => column.key);
  }, [columns, searchKeys]);

  const visibleRows = useMemo(() => {
    let nextRows = [...rows];

    if (searchable && query.trim()) {
      const normalizedQuery = query.trim().toLowerCase();
      nextRows = nextRows.filter((row) =>
        resolvedSearchKeys.some((key) =>
          String(getValue(row, key) ?? '').toLowerCase().includes(normalizedQuery)
        )
      );
    }

    if (sortConfig.key) {
      const column = columns.find((item) => item.key === sortConfig.key);
      if (column) {
        nextRows.sort((left, right) => {
          const leftValue = normalizeValue(
            column.sortValue ? column.sortValue(left) : getValue(left, sortConfig.key)
          );
          const rightValue = normalizeValue(
            column.sortValue ? column.sortValue(right) : getValue(right, sortConfig.key)
          );
          const result = compareValues(leftValue, rightValue);
          return sortConfig.direction === 'asc' ? result : result * -1;
        });
      }
    }

    return nextRows;
  }, [columns, query, resolvedSearchKeys, rows, searchable, sortConfig]);

  const toggleSort = (column) => {
    if (!column.key || column.sortable === false) {
      return;
    }

    setSortConfig((current) => {
      if (current.key === column.key) {
        return {
          key: column.key,
          direction: current.direction === 'asc' ? 'desc' : 'asc'
        };
      }

      return {
        key: column.key,
        direction: 'asc'
      };
    });
  };

  return (
    <section className="panel">
      {(title || description) && (
        <header className="panel__header">
          <div className="panel__intro">
            <div>
              {title ? <h3>{title}</h3> : null}
              {description ? <p>{description}</p> : null}
            </div>
            <div className="panel__meta">
              <span className="panel-badge panel-badge--accent">Đang hiển thị {visibleRows.length}</span>
              {visibleRows.length !== rows.length ? (
                <span className="panel-badge">Tổng {rows.length}</span>
              ) : null}
            </div>
          </div>
          {searchable ? (
            <div className="table-toolbar">
              <label className="table-search">
                <span>Tìm kiếm</span>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={searchPlaceholder}
                />
              </label>
            </div>
          ) : null}
        </header>
      )}

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key || column.label}>
                  {column.key && column.sortable !== false ? (
                    <button className="data-table__sort" type="button" onClick={() => toggleSort(column)}>
                      <span>{column.label}</span>
                      {sortConfig.key === column.key ? (
                        <span>{sortConfig.direction === 'asc' ? '^' : 'v'}</span>
                      ) : (
                        <span>&lt;&gt;</span>
                      )}
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visibleRows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="data-table__empty">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              visibleRows.map((row, index) => (
                <tr
                  key={row.id || row._id}
                  className={getRowClassName ? getRowClassName(row, index) : undefined}
                >
                  {columns.map((column) => {
                    if (column.type === 'status') {
                      return (
                        <td key={column.key}>
                          <StatusPill value={getValue(row, column.key)} />
                        </td>
                      );
                    }

                    return (
                      <td key={column.key || column.label}>
                        {column.render ? column.render(row) : getValue(row, column.key) || '--'}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
