declare module "@mapbox/mapbox-gl-draw" {
  import type { IControl, Map } from "mapbox-gl";

  interface DrawOptions {
    displayControlsDefault?: boolean;
    controls?: {
      polygon?: boolean;
      trash?: boolean;
      point?: boolean;
      line_string?: boolean;
      combine_features?: boolean;
      uncombine_features?: boolean;
    };
    defaultMode?: string;
  }

  interface DrawFeature {
    id: string;
    type: "Feature";
    properties: Record<string, unknown>;
    geometry: {
      type: string;
      coordinates: unknown;
    };
  }

  interface DrawEvent {
    features: DrawFeature[];
  }

  class MapboxDraw implements IControl {
    constructor(options?: DrawOptions);
    onAdd(map: Map): HTMLElement;
    onRemove(map: Map): void;
    add(geojson: object): string[];
    delete(ids: string | string[]): this;
    deleteAll(): this;
    get(id: string): DrawFeature | undefined;
    getAll(): { type: "FeatureCollection"; features: DrawFeature[] };
    set(featureCollection: object): string[];
    changeMode(mode: string, options?: object): this;
  }

  export default MapboxDraw;
}

declare module "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css" {
  const content: string;
  export default content;
}
