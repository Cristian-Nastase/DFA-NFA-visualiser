const fs = require('fs');

const map = new Map();
const states = new Set();
const alfabet = new Set();
const stackAlfabet = new Set();
let startState;
let startStackSymbol;
const finalStates = new Set();

const lambda = 'λ';

function readData(error, data) {
    if (error) {
        throw error;
    }

    let i = 0;
    const lines = data.split("\n");
    let temp;

    temp = new Set(lines[i++].split(" "));
    temp.forEach((elem) => {
        states.add(elem);
    });
    if (!states.size)
        throw new Error(`No states entered`);

    temp = new Set(lines[i++].split(" "));
    temp.forEach((elem) => {
        alfabet.add(elem);
    });
    if (!alfabet.size)
        throw new Error(`No alfabet entered`);

    temp = new Set(lines[i++].split(" "));
    temp.forEach((elem) => {
        stackAlfabet.add(elem);
    });
    if (!stackAlfabet.size)
        throw new Error(`No stack alfabet entered`);

    for (const state of states) {
        const line = lines[i++].split(";");

        if (line == '') {
            continue;
        }

        const transitionObject = {};

        for (const relation of line) {
            if (!relation || relation.trim() === '-') continue;

            const dashIdx = relation.indexOf('-');
            const leftPart = relation.slice(0, dashIdx).trim();
            const rightPart = relation.slice(dashIdx + 1).trim();

            const leftMembers = leftPart.split(",");
            const rightMembers = rightPart.split(",");

            const inputSymbol = leftMembers[0].trim();
            const stackTop = leftMembers[1].trim();
            const nextState = rightMembers[0].trim();
            const stackPush = rightMembers[1].trim();

            const isLambdaInput = inputSymbol === "eps" || inputSymbol === "λ";

            if (!isLambdaInput && !alfabet.has(inputSymbol))
                throw new Error(`No such symbol (${inputSymbol}) in alfabet`);
            if (!stackAlfabet.has(stackTop))
                throw new Error(`No such symbol (${stackTop}) in stack alfabet`);
            if (!states.has(nextState))
                throw new Error(`No such state (${nextState}) in states`);
            if (stackPush !== lambda && stackPush !== 'eps' && stackPush !== '') {
                for (const ch of stackPush.split('')) {
                    if (!stackAlfabet.has(ch))
                        throw new Error(`No such symbol (${ch}) in stack alfabet`);
                }
            }

            const inputKey = isLambdaInput ? lambda : inputSymbol;
            const transKey = `${inputKey},${stackTop}`;
            const transVal = { nextState, stackPush: (stackPush === 'eps' ? lambda : stackPush) };

            if (!transitionObject[transKey]) {
                transitionObject[transKey] = transVal;
            } else {
                const tempArr = Array.isArray(transitionObject[transKey])
                    ? transitionObject[transKey]
                    : [transitionObject[transKey]];
                tempArr.push(transVal);
                transitionObject[transKey] = tempArr;
            }
        }

        map.set(state, transitionObject);
    }

    startState = lines[i++].trim();
    if (!states.has(startState))
        throw new Error(`Start state '${startState}' not in states`);

    startStackSymbol = lines[i++].trim();
    if (!stackAlfabet.has(startStackSymbol))
        throw new Error(`Start stack symbol '${startStackSymbol}' not in stack alfabet`);

    temp = lines[i++].split(" ");
    temp.forEach((elem) => {
        finalStates.add(elem.trim());
    });

    PDA();
}

function toArray(val) {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    return [val];
}

function PDA() {
    const readline = require('readline-sync');
    const inputText = readline.question(`Enter a string: `);
    const input = inputText === lambda || inputText === 'eps' ? [] : inputText.split("");

    if (accepts(input)) {
        console.log(`${inputText} was accepted`);
    } else {
        console.log(`${inputText} was not accepted`);
    }
}

function accepts(input) {
    const initialConfig = [startState, 0, [startStackSymbol]];
    const queue = [initialConfig];
    const visited = new Set();

    while (queue.length) {
        const [currentState, currentIndex, stack] = queue.pop();

        const configKey = `${currentState}|${currentIndex}|${stack.join(',')}`;
        if (visited.has(configKey)) continue;
        visited.add(configKey);

        if (currentIndex === input.length && finalStates.has(currentState)) {
            return true;
        }

        const trans = map.get(currentState) || {};
        const stackTop = stack[stack.length - 1];

        if (stackTop === undefined) continue;

        const keysToTry = [
            currentIndex < input.length ? `${input[currentIndex]},${stackTop}` : null,
            `${lambda},${stackTop}`
        ].filter(Boolean);

        for (const key of keysToTry) {
            const isLambdaMove = key.startsWith(lambda + ',');
            const targets = toArray(trans[key]);

            for (const { nextState, stackPush } of targets) {
                const newStack = stack.slice(0, -1);
                if (stackPush !== lambda && stackPush !== '' && stackPush !== 'eps') {
                    for (let j = stackPush.length - 1; j >= 0; j--) {
                        newStack.push(stackPush[j]);
                    }
                }

                const newIndex = isLambdaMove ? currentIndex : currentIndex + 1;
                queue.push([nextState, newIndex, newStack]);
            }
        }
    }

    return false;
}

try {
    fs.readFile('datePDA.in', 'utf-8', (error, data) => readData(error, data));
} catch (error) {
    console.error(error);
}