const { error } = require('console');
const readline = require("readline-sync");
const fs = require('fs');

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
    temp.forEach((elem) => 
        {
            states.add(elem);
        });

    if(!states.size)
        throw new Error(`No states entered`);

    temp = new Set(lines[i++].split(" "));
    temp.forEach((elem) => 
        {
            alfabet.add(elem);
        });

    if(!alfabet.size) {
        throw new Error(`No alfabet entered`);
    }

    for (const state of states) {
        const line = lines[i++].split(";");

        const transitionObject = {};

        for (const relation of line) {
            const members = relation.split("-");

            const symbol = members[0];
            
            if(!alfabet.has(symbol))
                throw new Error(`No such symbol (${symbol}) in alfabet`);
            
            const nextState = members[1];

            if(!states.has(nextState))
                throw new Error(`No such state (${nextState}) in states`);

            if (!transitionObject[symbol]) {
                transitionObject[symbol] = nextState;
            }
            else {
                throw new Error(`Multiple transition states for the same symbol, this is a DFA`);
            }
        }

        map.set(state, transitionObject);
    }
    
    startState = lines[i++].split(" ")[0];
    temp = lines[i++].split(" ");
    temp.forEach((elem) => {
        finalStates.add(elem);
    })

    DFA();
}

function DFA()
{
    const inputText = readline.question(`Introdu un sir de caractere format din "1" si "0": `);
    const input = inputText.split("");
    
    let currentState = startState;
    let invalid = false;
    
    for (const symbol of input) {
        if (!alfabet.has(symbol)) {
            console.log(`Invalid symbol: ${symbol}`);
            invalid = true;
            break;
        }
    
        changeState(symbol);
    
        if (currentState == undefined) {
            break;
        }
    
        console.log(`${symbol} : ${currentState}`);
    }
    
    if (!invalid && currentState && finalStates.has(currentState)) {
        console.log(`${inputText} was accepted`);
    }
    else {
        console.log(`${inputText} was not accepted`);
    }
    
    function changeState(symbol) {
        const possibleWays = map.get(currentState);
    
        currentState = possibleWays[symbol];
    }
}

try {
    fs.readFile("date.in", "utf-8", (error, data) => (readData(error, data)));
}
catch(error) {
    console.error(error);
}
