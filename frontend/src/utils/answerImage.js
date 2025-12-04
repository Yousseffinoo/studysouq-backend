const BASE_WIDTH = 800;
const LINE_HEIGHT = 32;
const PADDING = 32;

function escapeXml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function answerTextToImage(text) {
  const lines = text.split("\n").map((line) => escapeXml(line.trim()));
  const height = PADDING * 2 + lines.length * LINE_HEIGHT;
  const tspanElements = lines
    .map(
      (line, index) =>
        `<tspan x="${PADDING}" dy="${index === 0 ? 0 : LINE_HEIGHT}">${line || " "}</tspan>`,
    )
    .join("");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${BASE_WIDTH}" height="${height}">
    <rect width="100%" height="100%" rx="24" fill="#04070c" stroke="#2F6FED" stroke-width="3"/>
    <text font-family="Inter, Arial, sans-serif" font-size="20" fill="#A9C7FF" y="${PADDING + 20}">
      ${tspanElements}
    </text>
  </svg>`;

  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

