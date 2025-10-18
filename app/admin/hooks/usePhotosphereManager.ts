import { useState, useCallback } from 'react';
import { Photosphere } from '../types/Photosphere';

export function usePhotosphereManager() {
    const [photospheres, setPhotospheres] = useState<Photosphere[]>([]);
    const [selectedPhotosphere, setSelectedPhotosphere] = useState<Photosphere | null>(null);
    const [loading, setLoading] = useState(false);

    // Fetch photospheres from S3
    const fetchPhotospheres = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/photospheres');
            if (response.ok) {
                const data = await response.json();
                setPhotospheres(data);
            } else {
                console.error('Failed to fetch photospheres');
            }
        } catch (error) {
            console.error('Error fetching photospheres:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const handleDeletePhotosphere = useCallback(async (id: string) => {
        try {
            console.log('Attempting to delete photosphere with ID:', id);
            const url = `/api/photospheres/${id}`;
            console.log('DELETE URL:', url);

            const response = await fetch(url, {
                method: 'DELETE',
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Photosphere deleted from S3:', result);

                // Remove from local state only after successful S3 deletion
                setPhotospheres(prev => prev.filter(p => p.id !== id));
                if (selectedPhotosphere?.id === id) {
                    setSelectedPhotosphere(null);
                }
            } else if (response.status === 403) {
                const error = await response.json().catch(() => ({ error: 'Permission denied' }));
                console.error('Permission error deleting photosphere:', error);
                alert('Erreur de permissions: L\'utilisateur AWS n\'a pas les droits pour supprimer les fichiers S3. Contactez l\'administrateur pour ajouter la permission s3:DeleteObject.');
            } else if (response.status === 207) {
                const error = await response.json().catch(() => ({ error: 'Partial deletion failure' }));
                console.error('Partial deletion failure:', error);
                alert(`Suppression partielle: ${error.message || 'Certains fichiers n\'ont pas pu être supprimés.'}`);
                // Refresh the list to see what remains
                fetchPhotospheres();
            } else {
                const error = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
                console.error('Failed to delete photosphere:', error);
                const errorMsg = error.details ? `${error.error}: ${error.details}` : (error.error || 'Erreur inconnue');
                alert('Erreur lors de la suppression de la photosphère: ' + errorMsg);
            }
        } catch (error) {
            console.error('Error deleting photosphere:', error);
            alert('Erreur lors de la suppression de la photosphère. Veuillez réessayer.');
        }
    }, [selectedPhotosphere, fetchPhotospheres]);

    return {
        photospheres,
        selectedPhotosphere,
        setSelectedPhotosphere,
        loading,
        fetchPhotospheres,
        handleDeletePhotosphere,
    };
}