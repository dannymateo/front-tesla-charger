import L from "leaflet";

/** Map marker asset — white Tesla T at 64px (also available as .ico). */
export const MAP_MARKER_ICON_URL = "/tesla-marker.ico";

export const MARKER_BORDER_GREEN = "#34C759";
export const MARKER_BORDER_RED = "#FF3B30";

export function getMarkerBorderColor(state: string): string {
  if (state === "AVAILABLE") return MARKER_BORDER_GREEN;
  return MARKER_BORDER_RED;
}

function markerHtml(
  borderColor: string,
  size: number,
  selected: boolean,
  extraClass = "",
): string {
  const logoSize = Math.round(size * 0.58);
  return `
    <div
      class="station-marker-dot${selected ? " station-marker-dot--selected" : ""}${extraClass ? ` ${extraClass}` : ""}"
      style="--marker-border-color:${borderColor};width:${size}px;height:${size}px"
    >
      <img
        src="${MAP_MARKER_ICON_URL}"
        width="${logoSize}"
        height="${logoSize}"
        alt=""
        class="station-marker-logo"
        draggable="false"
      />
    </div>
  `;
}

export function createStationMarkerIcon(
  state: string,
  selected: boolean,
): L.DivIcon {
  const size = selected ? 38 : 34;
  const borderColor = getMarkerBorderColor(state);

  return L.divIcon({
    className: "station-marker-icon",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: markerHtml(borderColor, size, selected),
  });
}

export function createPickerMarkerIcon(): L.DivIcon {
  const size = 42;
  return L.divIcon({
    className: "station-marker-icon",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: markerHtml(MARKER_BORDER_GREEN, size, false, "station-marker-dot--picker"),
  });
}
