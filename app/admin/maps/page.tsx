"use client";
import { useState, useEffect } from "react";
import { IMap } from "@/lib/models/MapModel";
import { createEmptyMapForm } from "@/lib/utils/createEmptyMapForm";
import { MapType } from "@/lib/types/MapType";
import { ExpansionType } from "@/lib/types/ExpansionType";
import dynamic from "next/dynamic";
import MarkerFormList from "./MarkerFormList";

const MapEditor = dynamic(() => import("./MapEditor"), { ssr: false });

export default function AdminMapsPage() {
	const [maps, setMaps] = useState<IMap[]>([]);
	const [selectedMapId, setSelectedMapId] = useState<string | null>(null);
	const [search, setSearch] = useState("");
	const [form, setForm] = useState<Partial<IMap>>(createEmptyMapForm());
	const [isSaving, setIsSaving] = useState(false);

	useEffect(() => {
		fetch("/api/maps")
			.then((res) => res.json())
			.then((data) => setMaps(data));
	}, []);

	useEffect(() => {
		if (selectedMapId) {
			const m = maps.find((m) => m.id === selectedMapId);
			if (m) setForm(m);
		} else {
			setForm(createEmptyMapForm());
		}
	}, [selectedMapId]);

	const filteredMaps = maps.filter((m) =>
		m.name.toLowerCase().includes(search.toLowerCase())
	);

	const handleSave = async () => {
		if (!form.name) return alert("Le nom est requis !");
		setIsSaving(true);

		console.log("Saving form:", form);

		const res = await fetch(`/api/maps/${form.id}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(form),
		});

		const savedMap = await res.json();

		if (selectedMapId) {
			setMaps(maps.map((m) => (m.id === savedMap.id ? savedMap : m)));
		} else {
			setMaps([...maps, savedMap]);
			setSelectedMapId(savedMap.id);
		}

		setIsSaving(false);
	};

	const handleDelete = async () => {
		if (!selectedMapId) return;
		if (!confirm("Supprimer cette map ?")) return;

		await fetch(`/api/maps/${selectedMapId}`, { method: "DELETE" });
		setMaps(maps.filter((m) => m.id !== selectedMapId));
		setSelectedMapId(null);
		setForm(createEmptyMapForm());
	};

	return (
		<div className="flex h-screen w-screen">
			<div className="p-4 flex flex-col gap-4">
				<h1 className="text-2xl mb-4">Admin - Maps</h1>

				{/* Recherche + bouton créer */}
				<div className="flex items-center gap-2 mb-4">
					<input
						placeholder="Rechercher..."
						value={search}
						onChange={(e) => setSearch(e.target.value)}
						className="border p-2 w-64"
					/>
					<button
						className="bg-green-500 text-white px-4 py-2"
						onClick={() => setSelectedMapId(null)}
					>
						+ Créer une nouvelle map
					</button>
				</div>

				{/* Liste des maps */}
				<div className="border p-2 rounded max-w-md">
					{filteredMaps.length === 0 ? (
						<p>Aucune map trouvée.</p>
					) : (
						<ul>
							{filteredMaps.map((m) => (
								<li
									key={m.id}
									className={`p-2 cursor-pointer hover:bg-gray-100 ${selectedMapId === m.id ? "bg-gray-200" : ""
										}`}
									onClick={() => setSelectedMapId(m.id)}
								>
									<span className="font-bold">{m.name}</span>{" "}
									{m.type && (
										<span className="text-gray-500">({m.type})</span>
									)}
								</li>
							))}
						</ul>
					)}
				</div>

				{/* Formulaire CRUD */}
				<div className="border p-4 rounded max-w-md flex flex-col gap-2">
					<h2 className="text-xl">
						{selectedMapId ? "Éditer la map" : "Créer une map"}
					</h2>

					{/* UUID affiché */}
					<input
						type="text"
						value={form.id || ""}
						disabled
						className="border p-2 bg-gray-100 text-gray-500"
					/>

					<input
						type="text"
						placeholder="Nom"
						value={form.name || ""}
						onChange={(e) => setForm({ ...form, name: e.target.value })}
						className="border p-2"
					/>

					{/* Expansion */}
					<select
						value={form.expansion || ExpansionType.ARR}
						onChange={(e) =>
							setForm({ ...form, expansion: e.target.value as ExpansionType })
						}
						className="border p-2"
					>
						{Object.values(ExpansionType).map((exp) => (
							<option key={exp} value={exp}>
								{exp}
							</option>
						))}
					</select>

					{/* Map Type */}
					<select
						value={form.type || MapType.MAP}
						onChange={(e) =>
							setForm({ ...form, type: e.target.value as MapType })
						}
						className="border p-2"
					>
						{Object.values(MapType).map((type) => (
							<option key={type} value={type}>
								{type}
							</option>
						))}
					</select>

					<input
						type="text"
						placeholder="Image Path"
						value={form.imagePath || ""}
						onChange={(e) => setForm({ ...form, imagePath: e.target.value })}
						className="border p-2"
					/>

					<div className="flex gap-2 mt-2">
						<button
							className="bg-blue-500 text-white px-4 py-2"
							onClick={handleSave}
							disabled={isSaving}
						>
							{isSaving ? "Sauvegarde..." : "Sauvegarder"}
						</button>

						{selectedMapId && (
							<button
								className="bg-red-500 text-white px-4 py-2"
								onClick={handleDelete}
							>
								Supprimer
							</button>
						)}
					</div>
				</div>

			</div>
			<div>
				<MarkerFormList
					markers={form.markers || []}
					onChange={(markers) => setForm({ ...form, markers })}
				/>
			</div>
			<div className="w-full h-full flex items-center justify-center">{form && (
				<MapEditor form={form} />
			)}</div>
		</div>
	);
}
