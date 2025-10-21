import React from 'react'
import AdminCard from './AdminCard'
import { FaFilter } from 'react-icons/fa'
import AdminExpansionSelector from './AdminExpansionSelector'
import AdminMapTypeSelector from './AdminMapTypeSelector'

const AdminFilters = () => {
    return (
        <AdminCard
            title="Filters"
            icon={<FaFilter />}
        >
            <div className="flex gap-4">
                <AdminExpansionSelector />
                <AdminMapTypeSelector />
            </div>
        </AdminCard>
    )
}

export default AdminFilters

