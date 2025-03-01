/**
 * SQL Server connection utilities (Browser-compatible mock)
 * 
 * Note: This is a mock implementation for browser environments.
 * In a real application, SQL Server connections would be handled by a backend service.
 */

// Mock connection pool
const mockPool = {
  connected: true,
  connecting: false,
  connect: async () => Promise.resolve(),
  close: async () => Promise.resolve(),
  request: () => ({
    input: () => {},
    query: async () => ({ recordset: [{ test: 1 }] })
  }),
  on: () => {}
};

/**
 * Get a connection pool to SQL Server (mock for browser)
 */
export async function getSqlServerPool() {
  console.warn('SQL Server connections are not supported in browser environments. This is a mock implementation.');
  return mockPool;
}

/**
 * Execute a SQL query with retry logic (mock for browser)
 */
export async function executeQuery(query, params = {}) {
  // Only log warning in development mode
  if (import.meta.env.DEV) {
    console.debug('SQL Server queries are not supported in browser environments. Using mock implementation.');
  }
  return { recordset: [] };
}

/**
 * Check if SQL Server is available (mock for browser)
 */
export async function isSqlServerAvailable() {
  // Only log warning in development mode
  if (import.meta.env.DEV) {
    console.debug('SQL Server availability check is not supported in browser environments. Using mock implementation.');
  }
  return false;
}

/**
 * Close the SQL Server connection pool (mock for browser)
 */
export async function closeSqlServerPool() {
  console.warn('SQL Server connection pool closing is not supported in browser environments. This is a mock implementation.');
  return;
}

export default {
  getSqlServerPool,
  executeQuery,
  isSqlServerAvailable,
  closeSqlServerPool
};