import { useLocale } from '@/app/providers/LocalContextProvider';
import React from 'react'
import { FaGlobe } from 'react-icons/fa';

const AdminLocaleSelector = () => {
    const { locale, setLocale } = useLocale();
    
    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center gap-2 mb-3">
                <FaGlobe className="text-purple-600" />
                <label className="font-semibold text-gray-900">Langue:</label>
            </div>
            <select
                value={locale}
                onChange={(e) => setLocale(e.target.value)}
                className="w-full border border-gray-300 p-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="ja">日本語</option>
            </select>
        </div>
    )
}

export default AdminLocaleSelector