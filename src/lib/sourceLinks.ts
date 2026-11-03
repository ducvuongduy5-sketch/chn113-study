import map from "../data/source-local-map.json";
/** Source references remain usable after a static build whenever the file was bundled. */
export function sourceUrl(id:string, page?:number|null):string | null {
  const link=(map as Record<string,string>)[id];
  return link ? `${link}${page ? `#page=${page}` : ''}` : null;
}
