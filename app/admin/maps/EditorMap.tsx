"use client";
import { MapContainer, Marker, Polygon, ImageOverlay } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Map } from "@/lib/types/Map";
import React, { useState } from "react";
import PolygonsEditor from "./PolygonsEditor";
import { getMapById } from "@/lib/utils/getMapById";
import { isMapExit } from "@/lib/utils/isMapExit";
import { useLocale } from "@/app/components/contexts/LocalContextProvider";

function getTextIcon(text: string, isHovered: boolean, isExit: boolean) {
	// Create a temporary span to measure text size
	const span = document.createElement("span");
	span.className =
		"marker tracking-wide font-myriad-cond text-lg whitespace-nowrap inline-block";
	span.style.position = "absolute";
	span.style.visibility = "hidden";
	span.innerText = text;
	document.body.appendChild(span);

	const width = span.offsetWidth;
	const height = span.offsetHeight;
	document.body.removeChild(span);

	return L.divIcon({
		className: `${isHovered ? "hovered" : ""} ${isExit ? "exit" : ""}`,
		html: `<span class="marker tracking-wide font-myriad-cond text-lg whitespace-nowrap inline-block">${text}</span>`,
		iconSize: [width, height],
		iconAnchor: [width / 2, height / 2], // Center anchor
	});
}

export default function EditorMap({ form, maps }: { form: Partial<Map>; maps: Map[] }) {
	const { locale } = useLocale();
	const defaultBounds: L.LatLngBoundsExpression = [[-100, -100], [100, 100]];

	const specialBounds: Record<string, L.LatLngBoundsExpression> = {
		"d05cc1fd-77f8-45d8-935a-8948e4c336f0": [[-110, -258], [110, 258]], // The Source
		"24dafd75-1150-4a15-b2cc-31a9d3f1e228": [[-110, -196], [110, 196]], // The First
	};

	const bounds =
		form.id && specialBounds[form.id] ? specialBounds[form.id] : defaultBounds;

	const baseUrl = process.env.NEXT_PUBLIC_S3_BUCKET_URL || "";
	const imageUrl = `${baseUrl}/maps/${form.imagePath}`;

	const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

	// Helper to get map name from ID
	const getMapName = (id: string) => {
		const map = getMapById(maps, id);
		if (!map) return "Unknown";
		// Ensure locale is a valid key of MapName
		return map.name[locale as keyof typeof map.name] || "Unknown";
	};
	
	return (
		<div className="border rounded aspect-square overflow-hidden w-[30rem] h-[30rem] pointer-events-auto shadow-[0px_0px_30px_black,0px_0px_30px_black] border-2 border-x-[#c0a270] border-y-[#e0c290] rounded-xl">
			<MapContainer
				center={[0, 0]}
				zoom={1}
				className="h-full w-full"
				crs={L.CRS.Simple}
			>
				{form.imagePath && <ImageOverlay url={imageUrl} bounds={bounds} />}
				<PolygonsEditor />

				{form.markers?.map((marker, idx) => (
					<React.Fragment key={idx}>
						{/* Marker as styled text */}
						<Marker
							position={marker.latLng}
							icon={getTextIcon(getMapName(marker.target), hoveredIdx === idx, isMapExit(form, getMapById(maps, marker.target)))}
							eventHandlers={{
								mouseover: () => setHoveredIdx(idx),
								mouseout: () => setHoveredIdx(null),
							}}
						/>

						{/* Area polygon */}
						{marker.geojson?.area && (
							<Polygon
								positions={marker.geojson.area}
								pathOptions={{
									stroke: false,
									fillOpacity: hoveredIdx === idx ? 0.15 : 0,
									fillColor: "white",
								}}
							/>
						)}

						{/* Hitbox polygon */}
						{marker.geojson?.hitbox && (
							<Polygon
								positions={marker.geojson.hitbox}
								pathOptions={{
									color: "transparent",
									fillOpacity: 0,
								}}
								eventHandlers={{
									mouseover: () => setHoveredIdx(idx),
									mouseout: () => setHoveredIdx(null),
								}}
							/>
						)}
					</React.Fragment>
				))}
			</MapContainer>
		</div>
	);
}
