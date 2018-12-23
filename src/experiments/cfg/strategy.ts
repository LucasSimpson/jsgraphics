import { ApplyableProduction, Grammar, Sentence } from './grammar';

export interface GrammarStrategy {
    chooseProduction: (sentence: Sentence, productions: Array<ApplyableProduction>) => ApplyableProduction,
}

export class SimpleStrategy implements GrammarStrategy {
    chooseProduction(sentence: Sentence, productions: Array<ApplyableProduction>): ApplyableProduction {
        return productions[Math.floor(Math.random() * productions.length)];
    }
}

export class LocalMaximumFitness implements GrammarStrategy {
    constructor(private getFitness: (sentence: Sentence) => number) { }

    chooseProduction(sentence: Sentence, productions: Array<ApplyableProduction>): ApplyableProduction {
        let highestFitness = 0;
        let bestProduction = productions[0];

        productions.forEach(prod => {
            let score = this.getFitness(prod.apply());
            if (score > highestFitness) {
                highestFitness = score;
                bestProduction = prod;
            }
        });

        return bestProduction;
    }
}

