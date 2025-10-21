import { useAdmin } from '@/app/providers/AdminContextProvider';
import React from 'react'
import { FaExclamationTriangle } from 'react-icons/fa';

const AdminMapError = () => {
    const { error } = useAdmin();
    
    return (
        <>
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-4 flex items-center gap-3">
                    <FaExclamationTriangle className="text-red-500 flex-shrink-0" />
                    <div className="text-sm">{error}</div>
                </div>
            )}
        </>
    )
}

export default AdminMapError

