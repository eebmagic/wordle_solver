const prompt = require('prompt-sync')();
const fs = require('fs');

function buildExpression(constraints, positiveConstraints) {
    let out = '^';
    for (let i = 0; i < 5; i++) {
        if (positiveConstraints[i]) {
            out += positiveConstraints[i];
        } else {
            out += `[^${constraints[i]}]`;
        }
    }
    out += '$';

    return RegExp(out);
}


// Collect inputs
let graysString = prompt('Enter all gray letters: ').trim();
let realGray = graysString.replace(/[^a-z]/gi, '');
let graySet = new Set(realGray);

let yellows = [];
console.log('\nEnter a yellow char (in format ..a.a)')
console.log('where using . to show unknown spaces.');
console.log('Write one string for each letter.');
console.log('Press enter with no string to finish.\n');
while (true) {
    let yellowString = prompt('Yellow string: ').trim().toLowerCase();
    let letterSet = new Set(yellowString);
    let intersection = new Set([...graySet].filter(x => letterSet.has(x)));

    if (yellowString == 'done' || yellowString == '') {
        break;
    } else {
        let charset = new Set(yellowString);
        if (yellowString.length != 5) {
            console.log('ERROR: strings must be 5 characters long.');
            console.log();
            continue;
        } else if (charset.size != 2) {
            console.log('ERROR: string should be built from only two chars (an alpha char and .)');
            console.log();
            continue;
        } else if (intersection.size != 0) {
            console.log('ERROR: yellow string and gray chars intersect:');
            console.log(intersection);
            console.log();
            continue;
        }

        yellows.push(yellowString);
    }
}
let yellowSet = new Set(yellows.join('').replace(/[^a-z]/gi, ''));

console.log('\nWrite all green chars as a string, filling in with . chars.')
let greenString;
while (true) {
    greenString = prompt('green string: ').trim().toLowerCase();
    let filtered = greenString.replace(/[a-z.]/gi, '');
    let greenSet = new Set(greenString.replace(/[^a-z.]/gi, ''));

    if (greenString == '') {
        greenString = '.....';
        break;
    } else if (greenString.length != 5) {
        console.log('ERROR: string should be 5 chars long.')
        continue;
    } else if (filtered != '') {
        console.log('ERROR: string should be built from chars a-z and . chars.')
        continue;
    } else {
        break;
    }
}

console.log('\nYellows:');
console.log(yellows);

console.log('\nGrays:');
console.log(realGray);

console.log('\nGreens:');
console.log(greenString);


// Build yellow constraints
let constraints = ["", "", "", "", ""];
yellows.forEach(yellow => {
    for (let i = 0; i < yellow.length; i++) {
        if (yellow[i] != '.') {
            constraints[i] += yellow[i];
        }
    }
});

for (let i = 0; i < 5; i++) {
    constraints[i] += realGray;
}

console.log('\nConstraints after adding yellows and grays');
console.log(constraints);


// Build green positive constraints
let positiveConstraints = ["", "", "", "", ""];
for (let i = 0; i < 5; i++) {
    if (greenString[i] != '.') {
        positiveConstraints[i] += greenString[i];
    }
}

console.log('\nGreen positive constraints:');
console.log(positiveConstraints);


// Filter by constraints
const words = fs.readFileSync('data/fives.txt', 'utf-8').split('\n');
console.log(words)

let expression = buildExpression(constraints, positiveConstraints);
let filteredWords = words.filter((word) => expression.test(word));
console.log(`EXPRESSION: ${expression}`);
console.log('RESULTING WORDS:');
console.log(filteredWords);


// Filter by full intersection with yellow set
console.log('Filtering for yellow set:');
console.log(yellowSet);
yellowSet.forEach((c) => {
    console.log(`Filtering by contains char: ${c}`)
    filteredWords = filteredWords.filter((word) => word.includes(c));
    console.log(filteredWords);
})
console.log('\nAFTER filtering by yellow letters:')
console.log(filteredWords);


// Rank results (a few different ways)
const freqs = require('./data/frequencies.json');
const letterFreqs = require('./data/letter_frequencies.json');

function getRanking(word) {
    let letters = [];
    let sum = 0;
    for (let i = 0; i < word.length; i++) {
        letters.push(letterFreqs[word[i]]);
        sum += letterFreqs[word[i]];
    }
    let charset = new Set(word);
    if (charset.size != 5) {
        sum -= (1 / charset.size);
    }

    let wordFreq = 0.5 + freqs[word];
    let out = wordFreq * (2 * sum);
    // console.log(word);
    // console.log(out);
    // console.log(letters);
    // console.log(wordFreq);
    // console.log();

    // return out;
    return wordFreq;
}

let values = {};
filteredWords.forEach((word) => {
    values[word] = getRanking(word);
})

let ranked = filteredWords.sort((a, b) => values[a] - values[b]).reverse();
console.log('\nWORDS AFTER RANKING:');
console.log(ranked);
// Rank by frequency of occurence in english

// Rank by letter popularity
