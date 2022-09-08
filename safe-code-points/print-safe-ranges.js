import SafeCodePoint from 'safe-code-point';

const safeCodePoint = await SafeCodePoint('4.1.0');
const numCodePoints = (1 << 16) - 1;

const safeCodePointRanges = [];
let currentBlock = null;
for (let codePoint = 0; codePoint < numCodePoints; codePoint++) {
    if (safeCodePoint(codePoint)) {
        if (currentBlock != null) {
            currentBlock.len += 1;
        } else {
            currentBlock = { start: codePoint, len: 1 };
        }
    } else if (currentBlock != null) {
        safeCodePointRanges.push(currentBlock);
        currentBlock = null;
    }
}

safeCodePointRanges.sort((a, b) => {
    return b.len - a.len;
});

let remaining = (1 << 15);
let i = 0;
for (; i < safeCodePointRanges.length; ++i) {
    remaining -= safeCodePointRanges[i].len;
    if (remaining <= 0) {
        break;
    }
}

let ourRanges = safeCodePointRanges.slice(0, i + 1);
console.log(ourRanges);
console.log((1 << 15), ' vs ', ourRanges.reduce((acc, x) => {
    return acc + x.len;
}, 0));

console.log(ourRanges.sort((a, b) => {
    return b.len - a.len;
}));

let declStr = `const BASE_START_LEN_TUPLES: [(u16, u16, u16); ${ourRanges.length}] = [(0, ${ourRanges[0].start}, ${ourRanges[0].len})`;
let u15Base = ourRanges[0].len;
for (const o of ourRanges.slice(1)) {
    declStr += `, (${u15Base}, ${o.start}, ${o.len})`;
    u15Base += o.len;
}
declStr += '];';
console.log(declStr);