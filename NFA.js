const { error } = require('console');
const readline = require("readline-sync");
const fs = require('fs');
const { type } = require('os');

const map = new Map();
const states = new Set();
const alfabet = new Set();
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

        const transitionObject = {};

        for (const relation of line) {
            const members = relation.split("-");

            const symbol = members[0];

            if (!alfabet.has(symbol))
                throw new Error(`No such symbol (${symbol}) in alfabet`);

            const nextState = members[1];

            if (!states.has(nextState))
                throw new Error(`No such state (${nextState}) in states`);

            if (!transitionObject[symbol]) {
                transitionObject[symbol] = nextState;
            }
            else {
                const tempArr = [transitionObject[symbol]];
                tempArr.push(nextState);
                transitionObject[symbol] = tempArr;
            }
        }

        map.set(state, transitionObject);
    }

    startState = lines[i++].split(" ")[0];
    temp = lines[i++].split(" ");
    temp.forEach((elem) => {
        finalStates.add(elem);
    })

    NFA();
}

function NFA() {
    const inputText = readline.question(`Enter a string: `);
    const input = inputText.split("");

    if (recursiveDFA(0, startState)) {
        console.log(`${inputText} was accepted`);
    }
    else {
        console.log(`${inputText} was not accepted`);
    }

    function recursiveDFA(currentIndex, currentState) {
        if(currentIndex === input.length) {
            if(finalStates.has(currentState))
                return true;
            
            return false;
        }

        const possibleWays = map.get(currentState)[input[currentIndex]];

        if(possibleWays && typeof possibleWays === "object") {
    
            if(possibleWays.includes(input[currentIndex]))
                return false;

            for(const way of possibleWays) {
                const accepted = recursiveDFA(currentIndex + 1, way);
                if(accepted)
                    return true;
            }

            return false;
        }
        else {
            if(possibleWays == undefined)
                return false;

            return recursiveDFA(currentIndex + 1, possibleWays);
        }
    }
}

try {
    fs.readFile("date.in", "utf-8", (error, data) => (readData(error, data)));
}
catch (error) {
    console.error(error);
}