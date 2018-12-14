import { ThreeJSWrapper } from './object3D';
import { TColor } from './models';
import * as THREE from 'three';


export class Color extends ThreeJSWrapper<TColor>{
    constructor(color: TColor) {
        super();
        this.asset = color;
    }

    static fromHex(hex: number): Color {
        return new Color(new THREE.Color(hex));
    }

    static fromRGB(r: number, g: number, b: number): Color {
        return new Color(new THREE.Color(r, g, b));
    }

    static fromBlend(colorWeights: Array<{color: Color, weight: number}>): Color {
        let totalWeight: number = colorWeights.reduce((s, c) => s + c.weight, 0);

        let black = new THREE.Color(0, 0, 0);

        let finalTColor = colorWeights
            .map(colorWeight => {
                let alpha = 1 - (colorWeight.weight / totalWeight);

                let color = colorWeight.color.clone();

                color.setAsset(color.getAsset().lerp(black, alpha));

                return color;
            })
            .reduce((finalColor, c) => finalColor.add(c.getAsset()), black);

        return new Color(finalTColor);
    }

    clone(): Color {
        return new Color(this.asset.clone());
    }
}
