// 해외 네트워크 지도용 점(dot) 좌표와 지사 핀 좌표를 미리 계산해 lib/map-data.json 으로 저장합니다.
// 지사 목록(lib/offices.json)을 수정한 뒤 `npm run gen:map` 을 실행하세요.
import fs from "node:fs";
import DottedMap from "dotted-map";

const offices = JSON.parse(fs.readFileSync(new URL("../lib/offices.json", import.meta.url), "utf8"));
const map = new DottedMap({ height: 60, grid: "diagonal" });

const all = [offices.headOffice, ...offices.regions.flatMap((r) => r.offices.map((o) => ({ ...o, region: r.id })))];
for (const o of all) map.addPin({ lat: o.lat, lng: o.lng, data: { id: o.id, region: o.region ?? "hq" } });

const pts = map.getPoints();
const r2 = (n) => Math.round(n * 100) / 100;
const dots = pts.filter((p) => !p.data).map((p) => [r2(p.x), r2(p.y)]);
const pins = pts.filter((p) => p.data).map((p) => ({ ...p.data, x: r2(p.x), y: r2(p.y) }));
const width = Math.ceil(Math.max(...pts.map((p) => p.x)) + 1);
const height = Math.ceil(Math.max(...pts.map((p) => p.y)) + 1);

fs.writeFileSync(new URL("../lib/map-data.json", import.meta.url), JSON.stringify({ width, height, dots, pins }));
console.log(`dots=${dots.length} pins=${pins.length}/${all.length} size=${width}x${height}`);
