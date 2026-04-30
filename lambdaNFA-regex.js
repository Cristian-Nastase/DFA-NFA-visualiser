const fs = require('fs');

const map = new Map();
const states = new Set();
const alfabet = new Set();
let startState;
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

    if (!alfabet.size) {
        throw new Error(`No alfabet entered`);
    }

    for (const state of states) {
        const line = lines[i++].split(";");

        if (line == '') {
            continue;
        }

        const transitionObject = {};

        for (const relation of line) {
            const members = relation.split("-");

            const symbol = members[0];
            const isLambda = symbol === "λ" || symbol === "eps";

            if (!isLambda && !alfabet.has(symbol))
                throw new Error(`No such symbol (${symbol}) in alfabet`);

            const nextState = members[1].trim();

            if (!states.has(nextState))
                throw new Error(`No such state (${nextState}) in states`);

            const key = isLambda ? lambda : symbol;

            if (!transitionObject[key]) {
                transitionObject[key] = nextState;
            } else {
                const tempArr = Array.isArray(transitionObject[key])
                    ? transitionObject[key]
                    : [transitionObject[key]];
                tempArr.push(nextState);
                transitionObject[key] = tempArr;
            }
        }

        map.set(state, transitionObject);
    }

    startState = lines[i++].split(" ")[0];
    temp = lines[i++].split(" ");
    temp.forEach((elem) => {
        finalStates.add(elem);
    });

    const result = nfaToRegex();
    console.log(`Regular Expression: ${result}`);
}

function toArray(val) {
    if (!val) return [];
    if (Array.isArray(val)) return val;
    return [val];
}

function lambdaClosure(stateSet) {
    const closure = new Set(stateSet);
    const stack = [...stateSet];
    while (stack.length) {
        const s = stack.pop();
        const trans = map.get(s) || {};
        const targets = toArray(trans[lambda]);
        for (const t of targets) {
            if (!closure.has(t)) {
                closure.add(t);
                stack.push(t);
            }
        }
    }
    return closure;
}

function getEdge(gnfa, from, to) {
    return (gnfa[from] && gnfa[from][to] !== undefined) ? gnfa[from][to] : null;
}

function setEdge(gnfa, from, to, val) {
    if (!gnfa[from]) gnfa[from] = {};
    gnfa[from][to] = val;
}

function union(r1, r2) {
    if (!r1 && !r2) return null;
    if (!r1) return r2;
    if (!r2) return r1;
    if (r1 === r2) return r1;
    return `${r1}|${r2}`;
}

function concat(r1, r2) {
    if (!r1 || !r2) return null;
    if (r1 === 'λ') return r2;
    if (r2 === 'λ') return r1;
    return `${wrap(r1)}${wrap(r2)}`;
}

function wrap(r) {
    if (!r) return r;
    let depth = 0;
    for (const c of r) {
        if (c === '(') depth++;
        else if (c === ')') depth--;
        else if (c === '|' && depth === 0) return `(${r})`;
    }
    return r;
}

function eliminateState(gnfa, gnfaStates, elim) {
    const loop = getEdge(gnfa, elim, elim);
    const loopPart = loop ? `(${loop})*` : null;

    for (const qi of gnfaStates) {
        if (qi === elim) continue;
        const leftPart = getEdge(gnfa, qi, elim);
        if (!leftPart) continue;

        for (const qj of gnfaStates) {
            if (qj === elim) continue;
            const rightPart = getEdge(gnfa, elim, qj);
            if (!rightPart) continue;

            const middle = loopPart ? concat(loopPart, rightPart) : rightPart;
            const newPath = concat(leftPart, middle);
            const existing = getEdge(gnfa, qi, qj);
            setEdge(gnfa, qi, qj, union(existing, newPath));
        }
    }
}

function nfaToRegex() {
    const newStart = 'S';
    const newAccept = 'F';
    const gnfaStates = [newStart, ...states, newAccept];
    const gnfa = {};

    for (const a of gnfaStates)
        for (const b of gnfaStates)
            setEdge(gnfa, a, b, null);

    setEdge(gnfa, newStart, startState, lambda);

    for (const from of states) {
        const trans = map.get(from) || {};

        for (const sym of alfabet) {
            const targets = toArray(trans[sym]);
            for (const target of targets) {
                const closure = lambdaClosure(new Set([target]));
                for (const to of closure) {
                    const cur = getEdge(gnfa, from, to);
                    setEdge(gnfa, from, to, union(cur, sym));
                }
            }
        }

        const selfClosure = lambdaClosure(new Set([from]));
        for (const to of selfClosure) {
            if (to === from) continue;
            const cur = getEdge(gnfa, from, to);
            setEdge(gnfa, from, to, union(cur, lambda));
        }
    }

    for (const f of finalStates) {
        const cur = getEdge(gnfa, f, newAccept);
        setEdge(gnfa, f, newAccept, union(cur, lambda));
    }

    for (const elim of states) {
        eliminateState(gnfa, gnfaStates, elim);
        gnfaStates.splice(gnfaStates.indexOf(elim), 1);
    }

    const result = getEdge(gnfa, newStart, newAccept);
    return result || 'Regex is empty';
}

try {
    fs.readFile('dateLambda.in', 'utf-8', (error, data) => readData(error, data));
} catch (error) {
    console.error(error);
}