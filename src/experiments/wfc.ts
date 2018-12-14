import { ViewManager } from '../viewManager';
import { Mesh } from '../three/object3D';
import { buildCube } from '../builder';
import { Color } from '../three/color';
import { Maybe } from '../maybe';

// type Color = number;
type Grid<T> = Array<Array<T>>;
type ColorTile = Grid<Color>;
type TileOdds = Array<{
    tile: ColorTile,
    probability: number,
}>;
type OutputTile = {
    probabilities: TileOdds,
    pg: PixelGrid,
    x: number,
    y: number,
};
type Output = Grid<OutputTile>;

export const run = () => {

    let view = new ViewManager();
    view.enableFlying(1);
    view.basicLighting();

    let sampleSizeX = 3;
    let sampleSizeY = 3;
    let outputSizeX = 9;
    let outputSizeY = 5;
    let outputPixelSize = 2;

    // build sample
    let black = Color.fromHex(0x222222);
    let white = Color.fromHex(0xdddddd);
    let red = Color.fromHex(0xdd2222);
    let green = Color.fromHex(0x22dd22);
    let sample: ColorTile = [
        [black, black, white, black, black],
        [black, black, black, red, black],
        [white, white, white, white, white],
        [black, green, black, black, black],
        [black, black, white, black, black],
    ];

    // build possible tiles from sample
    let possibleTiles: Array<ColorTile> = tilesFromSample(sample, sampleSizeX, sampleSizeY)
        .concat(tilesFromSample(rotateRight(sample), sampleSizeX, sampleSizeY))
        .concat(tilesFromSample(rotateRight(rotateRight(sample)), sampleSizeX, sampleSizeY))
        .concat(tilesFromSample(rotateRight(rotateRight(rotateRight(sample))), sampleSizeX, sampleSizeY));

    // show the sample
    PixelGrid.fromColorGrid(sample, view, -45, 25, 2);
    PixelGrid.fromColorGrid(rotateRight(sample), view, -45, 10, 2);
    PixelGrid.fromColorGrid(rotateRight(rotateRight(sample)), view, -45, -5, 2);
    PixelGrid.fromColorGrid(rotateRight(rotateRight(rotateRight(sample))), view, -45, -20, 2);

    // show possible tiles
    possibleTiles.forEach((tile, i) => {
        PixelGrid.fromColorGrid(tile, view, i * (sampleSizeX + 1) - 25, 28, 1);
    });

    // create output
    const initOutput = () => {
        let output: Output = [];
        for (let i = 0; i < outputSizeX; i++) {
            output.push([]);
            for (let j = 0; j < outputSizeY; j++) {
                let outputTile: OutputTile = {
                    probabilities: possibleTiles.map((pt: ColorTile) => {
                        return {
                            tile: pt,
                            probability: 1 / possibleTiles.length
                        };
                    }),
                    pg: new PixelGrid(
                        view,
                        -20 + i * (outputPixelSize * (sampleSizeX - 0)),
                        -20 + j * (outputPixelSize * (sampleSizeY - 0)),
                        sampleSizeX,
                        sampleSizeY,
                        outputPixelSize
                    ),
                    x: i,
                    y: j,
                };

                output[i].push(outputTile);
            }
        }

        return output;
    };

    let output = initOutput();
    collapseOutputColors(output);

    view.onKeyPress('r', t => {
        output = initOutput();
        collapseOutputColors(output);
    });

    view.onKeyPress('n', t => {
        if (!allDone(output)) {
            collapseOutputTile(selectTileForCollaps(output));
            propogateProbabilities(output);
            collapseOutputColors(output);
        }
    });

    view.start();
};

const flatten = <T>(grid: Array<Array<T>>): Array<T> => {
    return grid.reduce((arr, row) => arr.concat(row), []);
};

const showGrid = <T>(grid: Grid<T>, toString: (t: T) => string): void => {
    grid.forEach(row => {
       console.log(row.map(toString));
    });
};

const entropyForProbability = (prob: number): number => {
    return prob === 0 ? 0 : -prob * (Math.log(prob) / Math.log(2));
};

const outputTileEntropy = (tile: OutputTile): number => {
    return tile.probabilities
        .map(pair => pair.probability)
        .map(entropyForProbability)
        .reduce((s, e) => s + e, 0);
};

const propogateProbabilities = (output: Output): void => {
    type FloodContext<T> = {
        tile: T,
        surrounding: Array<Maybe<FloodContext<T>>>,
        visited: boolean,
        known: boolean,
        x: number,
        y: number,
    }
    type FloodGrid<T> = Grid<FloodContext<T>>;

    const initFloodGrid = <T>(grid: Grid<T>): FloodGrid<T> => {
        let floodGrid: FloodGrid<T> = [];

        for (let i = 0; i < grid.length; i++) {
            floodGrid.push([]);
            for (let j = 0; j < grid[i].length; j++) {
                floodGrid[i].push({
                    tile: grid[i][j],
                    surrounding: [],  // empty initially cause pointers havent been built
                    visited: false,
                    known: false,
                    x: i,
                    y: j,
                });
            }
        }

        // now that grid is done being built, update surrounding pointers
        flatten(floodGrid).forEach(c => c.surrounding = getSurroundingTiles(floodGrid, c.x, c.y));

        return floodGrid;
    };

    const gridLookup = <T>(grid: Grid<T>, i: number, j: number): Maybe<T> => {
        if (i < 0 || i >= grid.length || j < 0 || j > grid[0].length) {
            return Maybe.nothing();
        } else {
            return Maybe.of(grid[i][j]);
        }
    };

    const getSurroundingTiles = <T>(grid: Grid<T>, i: number, j: number): Array<Maybe<T>> => {
        return [
                gridLookup(grid, i - 1, j),
                gridLookup(grid, i + 1, j),
                gridLookup(grid, i, j - 1),
                gridLookup(grid, i, j + 1),
            ];
    };

    const flood = <T>(queue: Queue<FloodContext<T>>, floodGrid: FloodGrid<T>, f: (c: FloodContext<T>) => void): void => {
        while(!queue.isEmpty()) {
            queue
                .pop()
                .filter(context => !context.visited)
                .do(context => {
                    f(context);
                    context.visited = true;
                    getSurroundingTiles(floodGrid, context.x, context.y).forEach(c => c.do(ft => queue.push(ft)));
                });
        }
    };

    let floodGrid = initFloodGrid(output);
    let queue: Queue<FloodContext<OutputTile>> = new Queue(
        flatten(floodGrid)
            .filter(context => outputTileEntropy(context.tile) === 0)
            .map(context => {
                context.known = true;
                return context;
            })
    );
    flood(queue, floodGrid, context => {
        // if we already know stuff, we can skip
        if (context.known) {
            // console.log('Known at: ', context.x, context.y, ', Skipping');
            return;
        }

        let oddsToMerge: Array<TileOdds> = [];
        let baseOutputTile: OutputTile = context.tile;

        const doTilesEdgesMatch = (baseTile: ColorTile, otherTile: ColorTile, surroundIndex: number): boolean => {

            const areColorStripsEqual = (s1: Array<Color>, s2: Array<Color>): boolean => {
                const areColorsEqual = (c1: Color, c2: Color): boolean => {
                    let a1 = c1.getAsset();
                    let a2 = c2.getAsset();

                    return a1.r === a2.r && a1.g === a2.g && a1.b === a2.b;
                };

                for (let i = 0; i < s1.length; i++) {
                    if (!areColorsEqual(s1[i], s2[i])) {
                        // console.log('colors arent equal');
                        return false;
                    }
                }

                return true;
            };

            const fromBottom = (tile: ColorTile): Array<Color> => {
                return tile.map(r => r[0]);
            };
            const fromTop = (tile: ColorTile): Array<Color> => {
                return tile.map(r => r[r.length - 1]);
            };
            const fromLeft = (tile: ColorTile): Array<Color> => {
                return tile[0]
            };
            const fromRight = (tile: ColorTile): Array<Color> => {
                return tile[tile.length - 1];
            };

            if (surroundIndex == 0) {
                return areColorStripsEqual(fromLeft(baseTile), fromRight(otherTile));

            } else if (surroundIndex == 1) {
                return areColorStripsEqual(fromRight(baseTile), fromLeft(otherTile));

            } else if (surroundIndex == 2) {
                return areColorStripsEqual(fromBottom(baseTile), fromTop(otherTile));

            } else if (surroundIndex == 3) {
                return areColorStripsEqual(fromTop(baseTile), fromBottom(otherTile));
            }
        };

        const reNormalize = (odds: TileOdds): TileOdds => {
            let totalP = odds.map(o => o.probability).reduce((s, x) => s + x, 0);

            return odds.map(o => {
                return {
                    probability: totalP > 0 ? o.probability / totalP : 0,
                    tile: o.tile,
                };
            });
        };

        // for each surrounding output tile
        oddsToMerge = context.surrounding.map((mSc, surroundIndex) => {
            if (!mSc.isPresent()) {
                return Maybe.nothing<TileOdds>();
            }

            let sc = mSc.getOrCrash();
            if (!sc.known) {
                return Maybe.nothing<TileOdds>();
            }
            let tile = sc.tile;

            // for each surrounding tile's valid sample
            let intraTileOdds = tile.probabilities.map(p1 => {
                let sampleTile = p1.tile;
                let sampleProbabiltiy = p1.probability;
                let isValidAtAll = p1.probability > 0;

                // for each sample
                return baseOutputTile.probabilities.map(p2 => {
                    let baseSampleTile = p2.tile;
                    let baseProbability = p2.probability;
                    let edgeMatchCoef = isValidAtAll && doTilesEdgesMatch(baseSampleTile, sampleTile, surroundIndex) ? 1 : 0;

                    return {
                        tile: baseSampleTile,
                        probability: edgeMatchCoef * sampleProbabiltiy * baseProbability,
                    };
                });
            });

            // collapse odds
            return Maybe.of(intraTileOdds.reduce(
                (final, odds) => {
                    odds.forEach((o, i) => {
                        final[i].probability += o.probability;
                    });
                    return final;
                },
                intraTileOdds[0].map(o => {
                    return {
                        tile: o.tile,
                        probability: 0,
                    };
                }),
            ));
        }).filter(m => m.isPresent()).map(o => o.getOrCrash());

        // console.log('At: ', context.x, context.y, context.surrounding.filter(m => m.map(c => c.known).getOrElse(false)).length);
        // console.log('Odds: (', oddsToMerge.length, ')');
        // oddsToMerge.forEach(odds => console.log(odds.map(o => {
        //     return o;
        // })));

        let newProbabilities = reNormalize(oddsToMerge.reduce(
            (final, odds) => {
                odds.forEach((o, i) => {
                    final[i].probability *= o.probability;
                });
                return final;
            },
            oddsToMerge[0].map(o => {
                return {
                    tile: o.tile,
                    probability: 1,
                };
            }),
        ));

        baseOutputTile.probabilities = newProbabilities;
        context.known = true;

        // console.log('Final Odds:');
        // console.log(newProbabilities);
        // console.log('\n');
    });
};

const collapseOutputTile = (tile: OutputTile): OutputTile => {
    let s = 0;
    let p = Math.random();
    let choosen = 0;

    // console.log('Odds from choosen:');
    // console.log(tile.probabilities.map(p => p.probability));

    for (let i = 0; i < tile.probabilities.length; i++) {
        s += tile.probabilities[i].probability;
        if (p <= s) {
            choosen = i;
            break;
        }
    }

    tile.probabilities = tile.probabilities.map(p => {
        return {
            probability: 0,
            tile: p.tile,
        };
    });
    tile.probabilities[choosen].probability = 1;

    // console.log(tile.probabilities.map(p => p.probability))

    return tile;
};

const selectTileForCollaps = (output: Output): OutputTile => {
    let orderedOutputs = flatten(output)
        .map(tile => {
            return {t: tile, e: outputTileEntropy(tile)};
        })
        .filter(p => p.e > 0)
        .sort((a, b) => a.e - b.e);

    return orderedOutputs[0].t;
};

const allDone = (output: Output): boolean => {
    return flatten(output).map(outputTileEntropy).filter(e => e > 0).length === 0;
};

const tilesFromSample = (sample: ColorTile, tx: number, ty: number): Array<ColorTile> => {
    let X: number = sample.length;
    let Y: number = sample[0].length;

    let tiles: Array<ColorTile> = [];

    for (let i = 0; i <= X - tx; i++) {
        for (let j = 0; j <= Y - ty; j++) {
            let tile: ColorTile = [];
            for (let k = 0; k < tx; k++) {
                tile.push([]);
                for (let l = 0; l < ty; l++) {
                    tile[k].push(sample[i+k][j+l]);
                }
            }
            tiles.push(tile);
        }
    }

    return tiles;
};

const tileFromOutputTile = (outputTile: OutputTile): ColorTile => {
    let tile: ColorTile = [];

    for (let i = 0; i < outputTile.probabilities[0].tile.length; i++) {
        tile.push([]);
        for (let j = 0; j < outputTile.probabilities[0].tile[0].length; j++) {
            tile[i].push(Color.fromBlend(outputTile.probabilities.map(p => {
                return {
                    color: p.tile[i][j].clone(),
                    weight: p.probability,
                };
            })));
        }
    }

    return tile;
};

const rotateRight = (tile: ColorTile): ColorTile => {
    let newTile: ColorTile = Array(tile[0].length).map(_ => Array(tile.length));

    for (let i = 0; i < tile[0].length; i++) {
        newTile.push([]);
        for (let j = 0; j < tile.length; j++) {
            newTile[i].push(tile[j][i].clone());
        }
    }

    return newTile;
};

const collapseOutputColors = (output: Output) => {
    output.forEach(tiles => tiles.forEach(outputTile => {
        outputTile.pg.colorsFrom(tileFromOutputTile(outputTile));
    }));
};

class PixelGrid {
    private boxes: Array<Array<Mesh>>;

    constructor(vm: ViewManager, x: number, y: number, sx: number, sy: number, scale: number) {
        this.boxes = [];
        let color = Math.random() * 0xFFFFFF;

        for (let i = 0; i < sx; i++) {
            this.boxes.push([]);

            for (let j = 0; j < sy; j++) {
                let cube = buildCube([scale, scale, 0.1], color);
                cube.setPosition([
                    i * scale + x,
                    j * scale + y,
                    0,
                ]);

                this.boxes[i].push(cube);
                vm.addChild(cube);
            }
        }
    }

    static fromColorGrid(cg: ColorTile, vm: ViewManager, x: number, y: number, scale: number): PixelGrid {
        let pg = new PixelGrid(vm, x, y, cg.length, cg[0].length, scale);

        for (let i = 0; i < cg.length; i++) {
            for (let j = 0; j < cg[i].length; j++) {
                pg.boxes[i][j].setColor(cg[i][j]);
            }
        }

        return pg;
    }

    colorsFrom(cg: ColorTile) {
        if (cg.length !== this.boxes.length || cg[0].length !== this.boxes[0].length) {
            console.log('ERROR: dimensions dont match');
            console.log(cg.length, this.boxes.length, cg[0].length, this.boxes[0].length);
        }

        for (let i = 0; i < cg.length; i++) {
            for (let j = 0; j < cg[0].length; j++) {
                this.setColor(i, j, cg[i][j]);
            }
        }
    }

    setColor(x: number, y: number, color: Color) {
        this.boxes[x][y].setColor(color);
    }
}

class Queue<T> {
    private arr: Array<T>;

    constructor(init: Array<T>) {
        this.arr = init;
    }

    push(elem: T) {
        this.arr.push(elem);
    }

    peek(): Maybe<T> {
        return this.arr.length > 0 ? Maybe.of(this.arr[0]) : Maybe.nothing();
    }

    pop(): Maybe<T> {
        return this.peek().do(_ => this.arr = this.arr.slice(1));
    }

    isEmpty(): boolean {
        return !this.peek().isPresent();
    }

    asArray(): Array<T> {
        return this.arr;
    }
}

