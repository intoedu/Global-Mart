// 해외 네트워크 지도용 점(dot) 좌표와 지사 핀 좌표를 미리 계산해 lib/map-data.json 으로 저장합니다.
// 지사 목록(lib/offices.json)을 수정한 뒤 `npm run gen:map` 을 실행하세요.
import fs from "node:fs";
import DottedMap from "dotted-map";

const offices = JSON.parse(fs.readFileSync(new URL("../lib/offices.json", import.meta.url), "utf8"));
const map = new DottedMap({ height: 60, grid: "diagonal" });

const all = [offices.headOffice, ...offices.regions.flatMap((r) => r.offices.map((o) => ({ ...o, region: r.id })))];
for (const o of all) map.addPin({ lat: o.lat, lng: o.lng, data: { id: o.id, region: o.region ?? "hq" } });

// 해외 Biz정보 지역 버튼 위치 (lib/regions.ts 의 id 와 동일)
const BIZ_ANCHORS = [
  { id: "india", lat: 22, lng: 79 },
  { id: "southeast", lat: 8, lng: 108 },
  { id: "northeast", lat: 42, lng: 112 },
  { id: "central", lat: 44, lng: 66 },
  { id: "southwest", lat: 30, lng: 66 },
  { id: "middleeast", lat: 27, lng: 44 },
  { id: "northafrica", lat: 28, lng: 12 },
  { id: "southafrica", lat: -8, lng: 24 },
  { id: "easteurope", lat: 52, lng: 30 },
  { id: "etc", lat: 20, lng: -90 },
];
for (const a of BIZ_ANCHORS) map.addPin({ lat: a.lat, lng: a.lng, data: { anchor: a.id } });

const pts = map.getPoints();
const r2 = (n) => Math.round(n * 100) / 100;
const dots = pts.filter((p) => !p.data).map((p) => [r2(p.x), r2(p.y)]);
const pins = pts.filter((p) => p.data && !p.data.anchor).map((p) => ({ ...p.data, x: r2(p.x), y: r2(p.y) }));
const anchors = pts.filter((p) => p.data?.anchor).map((p) => ({ id: p.data.anchor, x: r2(p.x), y: r2(p.y) }));
const width = Math.ceil(Math.max(...pts.map((p) => p.x)) + 1);
const height = Math.ceil(Math.max(...pts.map((p) => p.y)) + 1);

// 점 3천여 개는 HTML 에 넣지 않고 정적 SVG 이미지 한 장으로 만듭니다 (페이지 용량·렌더링 부담 감소)
const d = dots.map(([x, y]) => `M${x} ${y}h0`).join("");
const svg = (color) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none"><path fill="none" stroke="${color}" stroke-linecap="round" stroke-width="0.54" d="${d}"/></svg>\n`;
fs.mkdirSync(new URL("../public/images/", import.meta.url), { recursive: true });
fs.writeFileSync(new URL("../public/images/world-dots.svg", import.meta.url), svg("#1e325a"));
fs.writeFileSync(new URL("../public/images/world-dots-light.svg", import.meta.url), svg("#ffffff"));

fs.writeFileSync(new URL("../lib/map-data.json", import.meta.url), JSON.stringify({ width, height, pins, anchors }));
console.log(`dots=${dots.length} pins=${pins.length}/${all.length} anchors=${anchors.length} size=${width}x${height}`);
