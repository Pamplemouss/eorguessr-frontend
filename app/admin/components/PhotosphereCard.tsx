import React from 'react'

const PhotosphereCard = ({
    title,
    icon,
    children
}: {
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
}) => {
    return (
        <div className="border border-slate-200 p-4 shadow-lg rounded-md grow">
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white">
                    {icon}
                </div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    {title}
                </h2>
            </div>
            <div>
                {children}
            </div>
        </div>
    )
}

export default PhotosphereCard