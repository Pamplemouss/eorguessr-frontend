import React from 'react'

const MapFormCategory = ({
    title,
    children
}: {
    title?: string;
    children?: React.ReactNode;
}) => {
    return (
        <div className="border-l-2 border-indigo-600 p-4 pt-2 rounded-lg shadow-lg">
            {title && <h3 className="text-lg font-semibold mb-2 text-indigo-600">{title}</h3>}
            <div className="flex flex-col gap-2">
                {children}
            </div>
        </div>
    )
}

export default MapFormCategory