import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';
import type { Material } from '$lib/stores/materials';

interface APIResponse {
    _id: string;
    level: number;
    courseCode: string;
    courseTitle: string;
    description: string;
    url: string;
    material?: string;
    createdAt: string;
    updatedAt: string;
    downloads?: number;
    category?: 'Past Questions' | 'Assignments' | 'Notes' | 'Handouts';
}

export const load: PageLoad = async ({ fetch }) => {
    try {
        const response = await fetch('/api/materials');
        
        if (!response.ok) {
            throw error(500, { message: 'Failed to load materials' });
        }

        const data = await response.json();
        
        // Transform the API response to match our Material interface
        const materials: Material[] = data.map((item: APIResponse) => ({
            _id: item._id,
            level: item.level,
            courseCode: item.courseCode,
            courseTitle: item.courseTitle,
            description: item.description,
            url: item.url,
            material: item.material,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
            downloads: item.downloads || 0,
            category: item.category || 'Notes'
        }));

        return { materials };
    } catch (err) {
        console.error('Error in load function:', err);
        throw error(500, { message: 'Failed to load materials' });
    }
};