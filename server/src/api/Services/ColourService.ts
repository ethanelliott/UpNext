import { Service } from "typedi";
import { Vec3 } from "node-vibrant/lib/color";
import Vibrant from "node-vibrant";

@Service()
export class ColourService {
    constructor() {
    }

    private static vec3ToHexString(rgb: Vec3): string {
        return `${ColourService.decToHex(Math.floor(rgb[0]))}${ColourService.decToHex(Math.floor(rgb[1]))}${ColourService.decToHex(Math.floor(rgb[2]))}`;
    }

    private static decToHex(dec: number) {
        const d = dec.toString(16);
        return d.length == 2 ? d : `0${d}`;
    }

    public async getColoursFor(albumArtworkUrl: string) {
        const palette = await Vibrant.from(albumArtworkUrl).getPalette();
        return {
            vibrant: ColourService.vec3ToHexString(palette.Vibrant.getRgb()),
            darkVibrant: ColourService.vec3ToHexString(palette.DarkVibrant.getRgb()),
            lightVibrant: ColourService.vec3ToHexString(palette.LightVibrant.getRgb()),
            muted: ColourService.vec3ToHexString(palette.Muted.getRgb()),
            darkMuted: ColourService.vec3ToHexString(palette.DarkMuted.getRgb()),
            lightMuted: ColourService.vec3ToHexString(palette.LightMuted.getRgb()),
        };
    }

}