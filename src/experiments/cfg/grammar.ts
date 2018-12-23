import { safeFind } from '../../maybe';

export interface GrammarSymbol {
    hash: () => string,
    eq: (other: GrammarSymbol) => boolean,
    toString: () => string,
}
export type Sentence = Array<GrammarSymbol>;

export interface Production {
    nonTerminal: GrammarSymbol,
    replacement: Sentence,
}

export type ApplyableProduction = {
    symbol: GrammarSymbol,
    production: Production,
    apply: () => Sentence,
}

export class Grammar {
    private nonTerminals: Array<GrammarSymbol>;
    private productionsMap: {[key: string]: Array<Production>};

    constructor(
        private productions: Array<Production>,
        private startSymbol: GrammarSymbol,
    ) {
        // derive non terminals by checking all nonTerminal symbols in all passed productions
        this.nonTerminals = this.productions.map(production => production.nonTerminal);

        // build LUT of nonTerminal => [Productions]
        this.productionsMap = this.nonTerminals
            .map(sym => {
                return [sym, this.productions.filter(production => production.nonTerminal.eq(sym))]
            })
            .reduce((lut: {[key: string]: Array<Production>}, pairs: [GrammarSymbol, Array<Production>]) => {
                lut[pairs[0].hash()] = pairs[1];
                return lut;
            }, {});

    }

    getApplyableProductions(sentence: Sentence): Array<ApplyableProduction> {
        // S * NT
        return sentence
            .map((sym, i) => {
                if (this.isNonTerminal(sym)) {
                    return this.productionsMap[sym.hash()]
                        .map(production => {
                            return {
                                symbol: sym,
                                production: production,
                                apply: () => {
                                    return sentence.slice(0, i).concat(production.replacement).concat(sentence.slice(i + 1));
                                }
                            }
                        });
                }

                return [] as Array<ApplyableProduction>;
            })
            .reduce((result, prod) => result.concat(prod), [])
    }

    initSentence(): Sentence {
        return [this.startSymbol];
    }


    isComplete(sentence: Sentence): boolean {
        return sentence.reduce((t, sym) => t && !this.isNonTerminal(sym), true);
    }

    static toString(sentence: Sentence): string {
        return sentence.reduce((str, sym) => {
            return str + sym.toString();
        }, '');
    }

    private symbolInSet(set: Array<GrammarSymbol>, symbol: GrammarSymbol): boolean {
        for (let s of set) {
            if (symbol.eq(s)) {
                return true;
            }
        }

        return false;
    }

    private isNonTerminal(symbol: GrammarSymbol): boolean {
        return this.symbolInSet(this.nonTerminals, symbol);
    }
}


// heres my rules
// build a grammar
// get list of possible rules to apply
// evaluate each one
// pick one
// repeat

