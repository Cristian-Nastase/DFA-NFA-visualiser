const { error } = require('console');
const fs = require('fs');

const map = new Map();
const states = new Set();
const lang = new Set();
let startState;
const finalStates = new Set();

function readData(error, data) {
    if (error) {
        throw error;
    }

    let i = 0;

    const lines = data.split("\n");
    let temp;
    
    temp = new Set(lines[i++].split(" "));
    temp.forEach((elem) => 
        {
            states.add(elem);
        });

    if(!states.size)
        throw new Error(`No states entered`);

    temp = new Set(lines[i++].split(" "));
    temp.forEach((elem) => 
        {
            lang.add(elem);
        });

    if(!lang.size) {
        throw new Error(`No lang entered`);
    }

    for (const state of states) {
        const line = lines[i++].split(";");

        const transitionObject = {};

        for (const relation of line) {
            const members = relation.split("-");

            const symbol = members[0];
            
            if(!lang.has(symbol))
                throw new Error(`No such symbol (${symbol}) in lang`);
            
            const state = members[1];

            if(!states.has(state))
                throw new Error(`No such state (${state}) in states`);

            if (transitionObject[symbol]) {
                const arr = [transitionObject[symbol]];
                arr.push(state);
                transitionObject[symbol] = arr;
            }

            else {
                transitionObject[symbol] = state;
            }
        }

        map.set(state, transitionObject);
    }
    
    startState = lines[i++].split(" ");
    temp = lines[i++].split(" ");
    temp.forEach((elem) => {
        finalStates.add(elem);
    })
    
    console.log(states, lang, map, startState, finalStates);
}

try {
    fs.readFile("date.in", "utf-8", (error, data) => (readData(error, data)));
}
catch(error) {
    console.error(error);
}
