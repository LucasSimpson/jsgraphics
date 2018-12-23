import { Grammar, GrammarSymbol, Production, Sentence } from './grammar';
import { GrammarStrategy, LocalMaximumFitness, SimpleStrategy } from './strategy';


const runGrammar = (grammar: Grammar, strategy: GrammarStrategy) => {
    let sentence = grammar.initSentence();
    console.log(sentence.toString());

    let count = 0;
    while(count < 100 && !grammar.isComplete(sentence)) {
        count += 1;

        let applyableProduction = strategy.chooseProduction(sentence, grammar.getApplyableProductions(sentence));

        sentence = applyableProduction.apply();
        console.log(Grammar.toString(sentence));
    }
};

export const run = () => {
    class BasicSymbol implements GrammarSymbol {
        constructor(public char: string) {}

        eq(s: BasicSymbol): boolean {
            return this.char == s.char;
        }

        hash() { return this.char }

        toString(): string {
            return this.char;
        }
    }

    class BasicProduction implements Production {
        constructor(public nonTerminal: BasicSymbol, public replacement: Sentence) {}
    }

    let exp = new BasicSymbol('exp');

    let add = new BasicSymbol(' + ');
    let sub = new BasicSymbol(' - ');
    let mult = new BasicSymbol(' * ');
    let div = new BasicSymbol(' / ');
    let sOne = new BasicSymbol('1');
    let sTwo = new BasicSymbol('2');
    let sThree = new BasicSymbol('3');

    const evaluate = (sentence: Sentence): number => {
        if (sentence.length > 30) {
            return 0;
        }

        const symToNumber = (sym: GrammarSymbol): number => {
            if (sym.eq(add)) {
                return 5;
            }
            if (sym.eq(sub)) {
                return 0;
            }
            if (sym.eq(mult)) {
                return 7;
            }
            if (sym.eq(div)) {
                return 5;
            }
            if (sym.eq(sOne)) {
                return 1;
            }
            if (sym.eq(sTwo)) {
                return 2;
            }
            if (sym.eq(sThree)) {
                return 3;
            }
            if (sym.eq(exp)) {
                return 1;
            }
        };

        let r = sentence.map(symToNumber).reduce((s, x) => s + x, 0);

        // console.log('\t\t', r, ' :: ', Grammar.toString(sentence));

        return r

    };

    let grammar = new Grammar(
        [
            new BasicProduction(exp, [exp, add, exp]),
            new BasicProduction(exp, [exp, sub, exp]),
            new BasicProduction(exp, [exp, mult, exp]),
            new BasicProduction(exp, [exp, div, exp]),
            new BasicProduction(exp, [sOne]),
            new BasicProduction(exp, [sTwo]),
            new BasicProduction(exp, [sThree]),
        ],
        exp,
    );

    runGrammar(grammar, new LocalMaximumFitness(evaluate));
};

