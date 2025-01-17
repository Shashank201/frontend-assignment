import React, { useState, useEffect } from 'react';
import './styles.css';

const PaginatedTable = () => {
  const [data, setData] = useState([]); // API data
  const [currentPage, setCurrentPage] = useState(1); // Current page
  const [pageSize, setPageSize] = useState(5); // Records per page
  const [isLoading, setIsLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null); // Reset error state
        const response = await fetch(
          'https://raw.githubusercontent.com/saaslabsco/frontend-assignment/refs/heads/master/frontend-assignment.json'
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        setData(result);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data. Please try again.');
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Pagination logic
  const totalPages = Math.ceil(data.length / pageSize);
  const paginatedData = data.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePrevious = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setCurrentPage(1); // Reset to first page
  };

  return (
    <div className='paginated-table' style={{ padding: '20px' }}>
      <h2>Paginated Table</h2>

      {/* Error Handling */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Table */}
      {isLoading ? (
        <p>Loading...</p>
      ) : data.length === 0 ? (
        <p>No data available.</p>
      ) : (
        <>
          <table
            role='table'
            aria-label='Data Table'
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              marginBottom: '10px',
            }}
          >
            <thead>
              <tr>
                <th>Sr No</th>
                <th>Percentage Funded</th>
                <th>Amount Pledged</th>
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((record) => (
                <tr key={record?.['s.no']}>
                  <td>{record?.['s.no']}</td>
                  <td>{record?.['percentage.funded']}</td>
                  <td>{record?.['amt.pledged']}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className='pagination'>
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              First
            </button>
            <button onClick={handlePrevious} disabled={currentPage === 1}>
              Previous
            </button>
            <span style={{ margin: '0 10px' }}>
              Page {currentPage} of {totalPages}
            </span>
            <button onClick={handleNext} disabled={currentPage === totalPages}>
              Next
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              Last
            </button>
            {/* Page Size Selector */}
            <span>
              <label htmlFor='pageSize'>Page Size: </label>
              <select
                id='pageSize'
                value={pageSize}
                onChange={handlePageSizeChange}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </span>
          </div>
        </>
      )}
    </div>
  );
};

export default PaginatedTable;
