"use client";
import { useState, useEffect } from "react";
import { createEmptyMapForm } from "@/lib/utils/createEmptyMapForm";
import { MapType } from "@/lib/types/MapTypeEnum";
import { Map, MapName } from "@/lib/types/Map";
import { Expansion } from "@/lib/types/ExpansionEnum";
import dynamic from "next/dynamic";
import MarkerFormList from "./MarkerFormList";
import { useLocale } from "@/app/components/contexts/LocalContextProvider";
import isEqual from "lodash.isequal";

const MapEditor = dynamic(() => import("./EditorMap"), { ssr: false });

export default function AdminMapsPage() {
	const { locale, setLocale } = useLocale();
	const [maps, setMaps] = useState<Map[]>([]);
	const [selectedMapId, setSelectedMapId] = useState<string | null>(null);
	const [search, setSearch] = useState("");
	const [form, setForm] = useState<Partial<Map>>(createEmptyMapForm());
	const [isSaving, setIsSaving] = useState(false);
	const [subareasEnabled, setSubareasEnabled] = useState((form.subAreas && form.subAreas.length > 0) || false);
	const [isDirty, setIsDirty] = useState(false);

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

	useEffect(() => {
		setSubareasEnabled((form.subAreas && form.subAreas.length > 0) || false);
	}, [form.id]);

	// Track if form is dirty
	useEffect(() => {
		if (!selectedMapId) {
			setIsDirty(true);
			return;
		}
		const selectedMap = maps.find(m => m.id === selectedMapId);
		setIsDirty(selectedMap ? !isEqual(form, selectedMap) : false);
	}, [form, selectedMapId, maps]);

	const filteredMaps = maps.filter((m) =>
		(m.name["en"] || "").toLowerCase().includes(search.toLowerCase())
	);

	const handleSave = async () => {
		if (!form.name) return alert("Le nom est requis !");
		setIsSaving(true);

		// Ensure region is set for REGION maps
		let formToSave = { ...form };
		if (formToSave.type === MapType.REGION) {
			formToSave.region = formToSave.id;
		}

		console.log("Saving form:", formToSave);

		const res = await fetch(`/api/maps/${formToSave.id}`, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(formToSave),
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

	function updateMapNameLocale(
		locale: keyof MapName,
		value: string
	) {
		setForm({
			...form,
			name: {
				en: form.name?.en ?? "",
				fr: form.name?.fr ?? "",
				de: form.name?.de ?? "",
				ja: form.name?.ja ?? "",
				[locale]: value
			}
		});
	}

	// Helper to update subareas and ensure uniqueness
	function setSubAreasSafe(newSubAreas: string[]) {
		const unique = Array.from(new Set(newSubAreas));
		setForm({ ...form, subAreas: unique });
	}

	// Helper to add self map if not present
	function ensureSelfInSubAreas() {
		if (!form.id) return;
		if (!form.subAreas?.includes(form.id)) {
			setSubAreasSafe([form.id, ...(form.subAreas || []).filter(id => id !== form.id)]);
		}
	}

	// Helper to remove self map
	function removeSelfFromSubAreas() {
		setSubAreasSafe((form.subAreas || []).filter(id => id !== form.id));
	}

	// Helper to move subarea up/down
	function moveSubArea(index: number, direction: "up" | "down") {
		const arr = [...(form.subAreas || [])];
		if (
			(direction === "up" && index === 0) ||
			(direction === "down" && index === arr.length - 1)
		) return;
		const swapWith = direction === "up" ? index - 1 : index + 1;
		[arr[index], arr[swapWith]] = [arr[swapWith], arr[index]];
		setSubAreasSafe(arr);
	}

	return (
		<div className="flex h-screen w-screen">
			<div className="p-4 flex flex-col gap-4">
				<h1 className="text-2xl mb-4">Admin - Maps</h1>
				{/* Langue */}
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
									<span className="font-bold">{m.name?.en || "Sans nom"}</span>{" "}
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

					{/* Map Name Locales */}
					<div className="flex flex-col gap-2">
						<label className="font-bold">Nom de la map (locales):</label>
						<input
							type="text"
							placeholder="Nom (EN)"
							value={form.name?.en || ""}
							onChange={(e) => updateMapNameLocale("en", e.target.value)}
							className="border p-2"
						/>
						<input
							type="text"
							placeholder="Nom (FR)"
							value={form.name?.fr || ""}
							onChange={(e) => updateMapNameLocale("fr", e.target.value)}
							className="border p-2"
						/>
						<input
							type="text"
							placeholder="Nom (DE)"
							value={form.name?.de || ""}
							onChange={(e) => updateMapNameLocale("de", e.target.value)}
							className="border p-2"
						/>
						<input
							type="text"
							placeholder="Nom (JA)"
							value={form.name?.ja || ""}
							onChange={(e) => updateMapNameLocale("ja", e.target.value)}
							className="border p-2"
						/>
					</div>

					{/* Expansion */}
					<select
						value={form.expansion || Expansion.ARR}
						onChange={(e) =>
							setForm({ ...form, expansion: e.target.value as Expansion })
						}
						className="border p-2"
					>
						{Object.values(Expansion).map((exp) => (
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

					{/* Region Field */}
					<select
						value={
							form.type === MapType.WORLD_MAP
								? ""
								: form.type === MapType.REGION
									? form.id || ""
									: form.region || ""
						}
						disabled={
							form.type === MapType.WORLD_MAP ||
							form.type === MapType.REGION
						}
						onChange={(e) =>
							setForm({ ...form, region: e.target.value })
						}
						className="border p-2"
					>
						<option value="">Aucune région</option>
						{maps
							.filter((m) => m.type === MapType.REGION)
							.map((region) => (
								<option key={region.id} value={region.id}>
									{region.name?.en || "Sans nom"}
								</option>
							))}
					</select>

					{/* Subareas Toggle & Editor */}
					<div className="flex flex-col gap-2">
						<label className="font-bold flex items-center gap-2">
							<input
								type="checkbox"
								checked={subareasEnabled}
								onChange={e => {
									const enabled = e.target.checked;
									setSubareasEnabled(enabled);
									if (enabled) {
										ensureSelfInSubAreas();
									} else {
										setSubAreasSafe([]);
									}
								}}
							/>
							Activer les sous-zones (subareas)
						</label>
						{subareasEnabled && (
							<>
								{/* Subareas List with reorder/remove */}
								<ul className="mb-2">
									{(form.subAreas || []).map((id, idx) => {
										const map = maps.find(m => m.id === id);
										return (
											<li key={id} className="flex items-center gap-2 mb-1">
												<span className="flex-1">{map?.name?.en || id}</span>
												<button
													disabled={idx === 0}
													onClick={() => moveSubArea(idx, "up")}
													className="px-2"
													title="Monter"
												>↑</button>
												<button
													disabled={idx === (form.subAreas?.length || 1) - 1}
													onClick={() => moveSubArea(idx, "down")}
													className="px-2"
													title="Descendre"
												>↓</button>
												<button
													onClick={() => {
														if (id === form.id) removeSelfFromSubAreas();
														else setSubAreasSafe((form.subAreas || []).filter(sid => sid !== id));
													}}
													className="px-2 text-red-500"
													title="Retirer"
												>X</button>
											</li>
										);
									})}
								</ul>
								{/* Add subareas select */}
								<label className="text-sm text-gray-500 mb-1">
									(Hold <kbd>Ctrl</kbd> or <kbd>Shift</kbd> to select multiple maps)
								</label>
								<select
									multiple
									value={(form.subAreas || []).filter(id => id !== form.id)}
									onChange={e => {
										const selected = Array.from(e.target.selectedOptions).map(opt => opt.value);
										const newSubAreas = form.id && form.subAreas?.includes(form.id)
											? [form.id, ...selected]
											: selected;
										setSubAreasSafe(newSubAreas);
									}}
									className="border p-2 h-32"
								>
									{maps
										.filter(m => m.id !== form.id)
										.map(m => (
											<option key={m.id} value={m.id}>
												{m.name?.en || "Sans nom"}
											</option>
										))}
								</select>
							</>
						)}
					</div>

					<input
						type="text"
						placeholder="Image Path"
						value={form.imagePath || ""}
						onChange={(e) => setForm({ ...form, imagePath: e.target.value })}
						className="border p-2"
					/>

					<div className="flex gap-2 mt-2">
						<button
							className="bg-blue-500 text-white px-4 py-2 flex items-center gap-2 relative"
							onClick={handleSave}
							disabled={isSaving}
						>
							{isDirty && !isSaving && (
								<span
									className="inline-block w-3 h-3 rounded-full bg-red-500 absolute -right-1.5 -top-1.5"
									title="Des modifications non sauvegardées"
								></span>
							)}
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
					maps={maps}
				/>
			</div>
			<div className="w-full h-full flex items-center justify-center">{form && (
				<MapEditor
					form={form}
					maps={maps}
					onMarkersChange={(markers) => setForm({ ...form, markers })}
				/>
)}</div>
		</div>
	);
}
