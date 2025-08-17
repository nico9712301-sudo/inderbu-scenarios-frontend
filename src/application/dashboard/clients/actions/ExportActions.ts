// Application Layer: Users Export Actions
// Handles CSV and Excel export functionality for users

import { UserFilters } from '@/entities/user/infrastructure/IUserRepository';
import { getUsersAction } from '@/infrastructure/web/controllers/dashboard/user.actions';

/**
 * Export Users to CSV
 * 
 * Fetches all users matching the filters and exports them as CSV.
 * Similar implementation to scenarios export functionality.
 */
export async function exportUsersToCSV(filters: UserFilters): Promise<void> {
  try {
    // Remove pagination to get all results
    const exportFilters: UserFilters = {
      ...filters,
      page: 1,
      limit: 10000, // Large limit to get all users
    };

    // Fetch users data
    const response = await getUsersAction(exportFilters);
    
    if (!response.success || !response.data) {
      throw new Error('Failed to fetch users data for export');
    }

    const users = response.data.data; // Extract users from paginated response

    // Prepare CSV headers
    const headers = [
      'ID',
      'DNI',
      'Nombre',
      'Apellido', 
      'Email',
      'Teléfono',
      'Dirección',
      'Rol',
      'Barrio',
      'Estado',
      'Fecha Creación'
    ];

    // Convert users to CSV rows
    const csvRows = users.map(user => [
      user.id?.toString() || '',
      user.dni?.toString() || '',
      user.firstName || '',
      user.lastName || '',
      user.email || '',
      user.phone || '',
      user.address || '',
      user.role || '',
      user.neighborhoodId?.toString() || '',
      user.isActive ? 'Activo' : 'Inactivo',
      user.createdAt ? new Date(user.createdAt).toLocaleDateString('es-ES') : ''
    ]);

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...csvRows.map(row => 
        row.map(field => `"${field.replace(/"/g, '""')}"`).join(',')
      )
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:-]/g, '');
      const filename = `usuarios_${timestamp}.csv`;
      link.setAttribute('download', filename);
      
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up
      URL.revokeObjectURL(url);
    }

    console.log(`Exported ${users.length} users to CSV`);
  } catch (error) {
    console.error('Error exporting users to CSV:', error);
    throw new Error('Failed to export users to CSV');
  }
}

/**
 * Export Users to Excel
 * 
 * Fetches all users matching the filters and exports them as Excel file.
 * Note: This would require additional libraries like 'xlsx' for full Excel support.
 * For now, exports as CSV with .xlsx extension as a simplified approach.
 */
export async function exportUsersToExcel(filters: UserFilters): Promise<void> {
  try {
    // For now, use CSV export with Excel extension
    // In a full implementation, would use 'xlsx' library for proper Excel format
    await exportUsersToCSV(filters);
    
    console.log('Excel export completed (using CSV format)');
  } catch (error) {
    console.error('Error exporting users to Excel:', error);
    throw new Error('Failed to export users to Excel');
  }
}

/**
 * Get Export Data Preview
 * 
 * Returns a preview of the data that would be exported,
 * useful for showing export confirmation dialogs.
 */
export async function getExportPreview(filters: UserFilters): Promise<{
  totalUsers: number;
  previewUsers: any[];
  appliedFilters: string[];
}> {
  try {
    // Fetch limited data for preview
    const previewFilters: UserFilters = {
      ...filters,
      page: 1,
      limit: 5, // Small limit for preview
    };

    const response = await getUsersAction(previewFilters);
    
    if (!response.success || !response.data) {
      throw new Error('Failed to fetch preview data');
    }

    // Build filter descriptions
    const appliedFilters: string[] = [];
    if (filters.search) appliedFilters.push(`Búsqueda: "${filters.search}"`);
    if (filters.roleId) appliedFilters.push(`Rol: ${filters.roleId}`);
    if (filters.neighborhoodId) appliedFilters.push(`Barrio: ${filters.neighborhoodId}`);
    if (filters.isActive !== undefined) appliedFilters.push(`Estado: ${filters.isActive ? 'Activo' : 'Inactivo'}`);

    return {
      totalUsers: response.data.meta.totalItems,
      previewUsers: response.data.data.slice(0, 3), // Show first 3 users
      appliedFilters,
    };
  } catch (error) {
    console.error('Error getting export preview:', error);
    throw new Error('Failed to get export preview');
  }
}