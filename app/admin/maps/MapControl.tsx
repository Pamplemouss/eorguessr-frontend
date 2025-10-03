import { invLerp, lerp } from "@/lib/utils/lerp";
import { useEffect, useState } from "react";
import { useMap } from "react-leaflet";
import L from 'leaflet';
import { createRoot } from 'react-dom/client';
import { FaMinus, FaPlus } from "react-icons/fa";

function ZoomSliderComponent({ map }: { map: L.Map }) {
    const [value, setValue] = useState(invLerp(map.getMinZoom(), map.getMaxZoom(), map.getZoom()) * 100);

    const handleOnChange = (event: any) => {
        setValue(event.target.value);
        map.setZoom(lerp(map.getMinZoom(), map.getMaxZoom(), event.target.value / 100), { animate: false });
    };

    useEffect(() => {
        const onZoom = () => {
            setValue(invLerp(map.getMinZoom(), map.getMaxZoom(), map.getZoom()) * 100);
        };

        map.on('zoom', onZoom);
        return () => {
            map.off('zoom', onZoom);
        };
    }, [map]);

    return (
        <div className="flex rotate-90 origin-top-left absolute -top-1 left-5">
            <div onClick={() => map.zoomIn()} className="cursor-pointer p-0.5 -rotate-90">
                <div className="overflow-hidden relative flex justify-center items-center rounded shadow w-5 h-5 shadow-black bg-gradient-to-tr from-[#513b1e] via-[#b49665] to-[#513b1e] hover:from-[#665033] hover:via-[#c9b17a] hover:to-[#665033] outline-t outline-yellow-300/50">
                    <FaPlus className="text-slate-900 text-[1rem] z-10" />
                    <FaPlus className="absolute text-yellow-200/40 text-[1rem] top-[4px] left-[4px]" />
                </div>
            </div>
            <input
                type="range"
                min="0"
                max="100"
                value={value}
                onChange={handleOnChange}
                className="zoom-slider w-24 4k:w-40 rotate-180 origin-center accent-red-300"
            />
            <div onClick={() => map.zoomOut()} className="cursor-pointer p-0.5 -rotate-90">
                <div className="overflow-hidden relative flex justify-center items-center rounded shadow w-5 h-5 shadow-black bg-gradient-to-tr from-[#513b1e] via-[#b49665] to-[#513b1e] hover:from-[#665033] hover:via-[#c9b17a] hover:to-[#665033]">
                    <FaMinus className="text-slate-900 text-[1rem] z-10" />
                    <FaMinus className="absolute text-yellow-200/40 text-[1rem] top-[4px] left-[4px]" />
                </div>
            </div>
        </div>
    );
}

export default function MapControl() {
    const map = useMap();

    useEffect(() => {
        const control = new L.Control({ position: "topleft" });

        control.onAdd = function () {
            const div = L.DomUtil.create('div', 'custom-zoom-control');

            // Prevent map interactions when interacting with the control
            L.DomEvent.disableClickPropagation(div);
            L.DomEvent.disableScrollPropagation(div);

            // Create React root and render component
            const root = createRoot(div);
            root.render(<ZoomSliderComponent map={map} />);

            // Store root for cleanup
            (div as any)._reactRoot = root;

            return div;
        };

        control.onRemove = function (map) {
            const div = this.getContainer();
            if (div && (div as any)._reactRoot) {
                (div as any)._reactRoot.unmount();
            }
        };

        map.addControl(control);

        return () => {
            map.removeControl(control);
        };
    }, [map]);

    return null;
}
