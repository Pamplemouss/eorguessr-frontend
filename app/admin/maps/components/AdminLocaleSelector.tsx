import { useLocale } from '@/app/providers/LocalContextProvider';
import React from 'react'

const AdminLocaleSelector = () => {
    const { locale, setLocale } = useLocale();
    
    return (
        <div className="flex items-center gap-2 mb-4">
            <label className="font-bold">Langue:</label>
            <select
                value={locale}
                onChange={(e) => setLocale(e.target.value)}
                className="border p-2"
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