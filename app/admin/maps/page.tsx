"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminMapsPage() {
    const router = useRouter();

    useEffect(() => {
        router.push('/admin#maps');
    }, [router]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <h1 className="text-xl font-semibold text-gray-900 mb-2">Redirection...</h1>
                <p className="text-gray-600">Vous êtes redirigé vers la nouvelle interface d'administration.</p>
            </div>
        </div>
    );
}
