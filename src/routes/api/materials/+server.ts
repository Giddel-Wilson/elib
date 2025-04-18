import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const API_BASE_URL = 'https://foc-e-library-backend.onrender.com/api/v1';

export const GET: RequestHandler = async ({ fetch, url }) => {
    try {
        const materialId = url.searchParams.get('download');
        
        if (materialId) {
            console.log('Download request for:', materialId);

            // Add debug logging
            const downloadUrl = `${API_BASE_URL}/materials/${materialId}/download`;
            console.log('Fetching from:', downloadUrl);

            const downloadResponse = await fetch(downloadUrl);
            
            if (!downloadResponse.ok) {
                console.error('Download failed:', {
                    status: downloadResponse.status,
                    statusText: downloadResponse.statusText
                });
                throw error(downloadResponse.status, 'Failed to download material');
            }

            const blob = await downloadResponse.blob();
            const contentType = downloadResponse.headers.get('content-type') || 'application/pdf';
            const filename = downloadResponse.headers.get('content-disposition')?.split('filename=')[1] || 
                           `document-${materialId}.pdf`;

            return new Response(blob, {
                headers: {
                    'Content-Type': contentType,
                    'Content-Disposition': `attachment; filename="${filename}"`,
                }
            });
        }

        // Regular materials fetch
        const response = await fetch(`${API_BASE_URL}/materials`);
        if (!response.ok) throw error(response.status, 'Failed to fetch materials');
        const data = await response.json();
        return json(data);

    } catch (err) {
        console.error('Server error:', err);
        throw error(500, err instanceof Error ? err.message : 'Internal Server Error');
    }
};