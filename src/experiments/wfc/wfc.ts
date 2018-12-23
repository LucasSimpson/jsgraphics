import { ViewManager } from '../../viewManager';
import { Line, Mesh } from '../../three/object3D';
import { buildCube, buildLine } from '../../builder';
import { Color } from '../../three/color';
import { Maybe } from '../../maybe';

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

const log = console.log;

const DEBUG: boolean = false;
if (!DEBUG) {
    console.log = () => {};
}


export const run = () => {

    let view = new ViewManager();
    view.enableFlying(1);
    view.basicLighting();

    let sampleSizeX = 2;
    let sampleSizeY = 2;
    let outputSizeX = 25;
    let outputSizeY = 15;
    let outputPixelSize = 2;
    let shift: number = 0.05;

    // build sample
    let black = Color.fromHex(0x222222);
    let white = Color.fromHex(0xdddddd);
    let red = Color.fromHex(0xdd2222);
    let green = Color.fromHex(0x22dd22);
    let yellow = Color.fromHex(0xdddd22);


    let s1: ColorTile = [
        [black, black, white, black, black],
        [black, black, black, red, black],
        [white, white, white, white, white],
        [black, green, black, black, black],
        [black, black, white, black, black],
    ];

    let s2: ColorTile = [
        [black, red, white, red, black],
        [green, black, black, black, red],
        [white, white, white, white, white],
        [green, black, black, black, red],
        [black, green, white, green, black],
    ];

    let s3: ColorTile = [
        [white, white, white, white],
        [white, black, black, black],
        [white, black, red, black],
        [white, black, black, black],
    ];

    let s4: ColorTile = [
        [black, black, black, black, black, black],
        [black, black, yellow, black, black, black],
        [black, yellow, red, yellow, black, black],
        [black, black, yellow, black, black, black],
        [black, black, white, black, black, black],
        [black, black, white, white, black, black],
        [black, black, black, white, black, black],
        [black, black, black, black, black, black],
        [black, black, black, black, black, black],
        [black, black, black, black, black, black],
        [black, black, black, black, black, black],
    ];

    let sample = s3;

    // build possible tiles from sample
    let possibleTiles: Array<ColorTile> = tilesFromSample(sample, sampleSizeX, sampleSizeY)
        .concat(tilesFromSample(rotateRight(sample), sampleSizeX, sampleSizeY))
        .concat(tilesFromSample(rotateRight(rotateRight(sample)), sampleSizeX, sampleSizeY))
        .concat(tilesFromSample(rotateRight(rotateRight(rotateRight(sample))), sampleSizeX, sampleSizeY));

    // show the sample
    PixelGrid.fromColorGrid(sample, view, -70, 30, 2);
    PixelGrid.fromColorGrid(rotateRight(sample), view, -70, 15, 2);
    PixelGrid.fromColorGrid(rotateRight(rotateRight(sample)), view, -70, 0, 2);
    PixelGrid.fromColorGrid(rotateRight(rotateRight(rotateRight(sample))), view, -70, -15, 2);

    // show possible tiles
    possibleTiles.forEach((tile, i) => {
        PixelGrid.fromColorGrid(tile, view, i * (sampleSizeX + 1) - 40, 34.5, 1);
    });

    // create output
    const initOutput = () => {
        let newOutput: Output = [];
        for (let i = 0; i < outputSizeX; i++) {
            newOutput.push([]);
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
                        -35 + i * (outputPixelSize * (sampleSizeX  + shift)),
                        -30 + j * (outputPixelSize * (sampleSizeY  + shift)),
                        sampleSizeX,
                        sampleSizeY,
                        outputPixelSize
                    ),
                    x: i,
                    y: j,
                };

                newOutput[i].push(outputTile);
            }
        }

        return newOutput;
    };

    let outputs: Array<Output> = [initOutput()];
    let outputIndex: number = 0;

    collapseOutputColors(outputs[outputIndex]);

    view.onKeyPress('r', t => {
        flatten(outputs[outputIndex]).forEach(t => t.pg.setShowBorder(false));
        outputIndex = 0;
        outputs = [initOutput()];
        collapseOutputColors(outputs[outputIndex]);
    });

    view.onKeyPress('n', t => {
        if (!allDone(outputs[outputIndex])) {
            log('Iter...');

            outputIndex += 1;
            if (outputIndex >= outputs.length) {
                let newOutput = cloneOutput(outputs[outputIndex - 1]);
                collapseOutputTile(selectTileForCollaps(newOutput));
                propogateProbabilities(newOutput);

                if (DEBUG) {
                    outputs.push(newOutput);
                } else {
                    outputIndex -= 1;
                    outputs[outputIndex] = newOutput;
                }
            }
            collapseOutputColors(outputs[outputIndex]);

            log('Done');
        } else {
            log('Nothing to do!');
        }
    });

    view.onKeyPress('b', t => {
        if (outputIndex > 0) {
            outputIndex -= 1;
            collapseOutputColors(outputs[outputIndex]);
        }
    });

    view.start();
};

const cloneOutput = (output: Output): Output => {
    const cloneColorTile = (tile: ColorTile): ColorTile => {
        let newTile: ColorTile = [];

        for (let i = 0; i < tile.length; i++) {
            newTile.push([]);
            for (let j = 0; j < tile[i].length; j++) {
                newTile[i].push(tile[i][j].clone());
            }
        }

        return newTile;
    };

    const cloneOutputTile = (outputTile: OutputTile): OutputTile => {
        return {
            probabilities: outputTile.probabilities.map(pt => {
                return {
                    probability: pt.probability,
                    tile: cloneColorTile(pt.tile),
                };
            }),
            pg: outputTile.pg,
            x: outputTile.x,
            y: outputTile.y,
        };
    };

    let cloned: Output = [];

    for (let i = 0; i < output.length; i++) {
        cloned.push([]);
        for (let j = 0; j < output[i].length; j++) {
            cloned[i].push(cloneOutputTile(output[i][j]));
        }
    }

    return cloned;
};

const flatten = <T>(grid: Array<Array<T>>): Array<T> => {
    return grid.reduce((arr, row) => arr.concat(row), []);
};

const showGrid = <T>(grid: Grid<T>, toString: (t: T) => string): void => {
    grid.forEach(row => {
       console.log(row.map(toString));
    });
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
        depth: number,
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
                    depth: Infinity,  // actual real use case wow
                    x: i,
                    y: j,
                });
            }
        }

        // now that grid is done being built, update surrounding pointers
        flatten(floodGrid).forEach(c => c.surrounding = getSurroundingTiles(floodGrid, c.x, c.y));

        return floodGrid;
    };

    const flood = <T>(queue: Queue<FloodContext<T>>, floodGrid: FloodGrid<T>, f: (c: FloodContext<T>) => void): void => {
        let floodPoints: Array<FloodContext<T>>;
        let depth: number = 1;
        let done = false;

        while(!done) {
            // clear floodPoints array
            floodPoints = [];

            // go through everything in the queue, adding flood tiles floodPoints
            while(!queue.isEmpty()) {
                queue
                    .pop()
                    .filter(context => !context.visited)
                    .do(context => {
                        console.log('Exploring (', context.x, ',', context.y, ') at depth of ', depth);

                        context.surrounding = context.surrounding.map(mft => mft.filter(ft => ft.depth < depth));
                        f(context);
                        context.visited = true;
                        floodPoints.push(context);
                    })
            }

            // populate queue with new tiles
            depth += 1;
            floodPoints.forEach(context => {
                getSurroundingTiles(floodGrid, context.x, context.y)
                    .forEach(c => c
                        .filter(ft => !ft.visited)
                        .map(ft => {
                            ft.depth = depth;
                            return ft;
                        })
                        .do(ft => queue.push(ft))
                    );
            });

            // if queue is empty after repopulating, were done
            done = queue.isEmpty();
        }

        console.log('');
        console.log('***************');
        console.log('***************');
        console.log('***************');
        console.log('');

    };

    let floodGrid = initFloodGrid(output);
    let queue: Queue<FloodContext<OutputTile>> = new Queue(
        flatten(floodGrid)
            .filter(context => outputTileEntropy(context.tile) === 0)
            .map(context => {
                context.known = true;
                context.depth = 1;
                return context;
            })
    );
    flood(queue, floodGrid, context => {
        // if we already know stuff, we can skip
        if (context.known) {
            console.log('Skipping ', context.x, context.y);
            return;
        } else {
            console.log('Flood callback on ', context.x, context.y);
        }

        let oddsToMerge: Array<TileOdds>;
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

        // base tile probabilities start as flat distribution across options
        let totalOptions = baseOutputTile.probabilities.length;
        baseOutputTile.probabilities = baseOutputTile.probabilities.map(pt => {
            return {
                tile: pt.tile,
                probability: 1 / totalOptions,
            };
        });

        // for each surrounding output tile
        oddsToMerge = context.surrounding.map((mSc, surroundIndex) => {

            // accesing adjecent tile thats off the grid or illegal to access at this time
            if (!mSc.isPresent()) {
                return Maybe.nothing<TileOdds>();
            }
            let tile = mSc.getOrCrash().tile;

            console.log('Checking against ', tile.x, tile.y);
            console.log(tile.probabilities.map(o => o.probability));

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

        baseOutputTile.probabilities = reNormalize(oddsToMerge.reduce(
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

        if (context.depth > 1) {
            console.log('Odds for (', context.x, ',', context.y, '): (',  baseOutputTile.probabilities.reduce((s, o) => s + o.probability, 0), ')', baseOutputTile.probabilities.map(o => o.probability));
        }

        context.known = true;
    });
};

const collapseOutputTile = (tile: OutputTile): OutputTile => {
    let s = 0;
    let p = Math.random();
    let choosen = 0;

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

    return tile;
};

const selectTileForCollaps = (output: Output): OutputTile => {
    let known = flatten(output).filter(t => outputTileEntropy(t) === 0);

    if (known.length === 0) {
        let ol = flatten(output);
        return ol[Math.floor(Math.random() * ol.length)];
    }

    return known
        .map(t => getSurroundingTiles(output, t.x, t.y))
        .reduce((arr, s) => arr.concat(s), [])
        .filter(mt => mt.isPresent())
        .map(mt => mt.getOrCrash())
        .filter(t => outputTileEntropy(t) > 0)
        .sort((a, b) => outputTileEntropy(a) - outputTileEntropy(b))[0]
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
    let dimX = tile.length;
    let newTile: ColorTile = [];

    for (let i = 0; i < tile[0].length; i++) {
        newTile.push(Array(dimX - 1));
    }

    for (let i = 0; i < dimX; i++) {
        for (let j = 0; j < tile[i].length; j++) {
            newTile[j][dimX - i - 1] = tile[i][j];
        }
    }

    return newTile;
};

const collapseOutputColors = (output: Output) => {
    output.forEach(tiles => tiles.forEach(outputTile => {
        outputTile.pg.colorsFrom(tileFromOutputTile(outputTile));
        outputTile.pg.setShowBorder(DEBUG ? outputTileEntropy(outputTile) === 0 : false)
    }));
};

class PixelGrid {
    private boxes: Array<Array<Mesh>>;
    private borderLines: Array<Line>;

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

        let bX = x - scale / 2;
        let bY = y - scale / 2;
        let raise = 0.05;
        this.borderLines = [
            buildLine([bX, bY, raise], [bX + sx * scale, bY, raise], 0xff69b4),
            buildLine([bX, bY, raise], [bX, bY + sy * scale, raise], 0xff69b4),
            buildLine([bX + sx * scale, bY + sy * scale, raise], [bX + sx * scale, bY, raise], 0xff69b4),
            buildLine([bX + sx * scale, bY + sy * scale, raise], [bX, bY + sy * scale, raise], 0xff69b4),
        ];

        this.borderLines.forEach(l => vm.addChild(l));
        this.borderLines.forEach(l => l.setVisibility(false));
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

    setShowBorder(show: boolean) {
        this.borderLines.forEach(l => l.setVisibility(show));
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

