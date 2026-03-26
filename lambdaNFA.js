const { error } = require('console');
const readline = require("readline-sync");
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

        if(line == '') {
            continue;
        }

        const transitionObject = {};

        for (const relation of line) {
            const members = relation.split("-");

            const symbol = members[0];
            const isLambda = symbol === "λ" || symbol === "eps";

            
            if(!isLambda && !alfabet.has(symbol))
                throw new Error(`No such symbol (${symbol}) in alfabet`);
            
            const nextState = members[1];

            if(!states.has(nextState))
                throw new Error(`No such state (${nextState}) in states`);


            const key = isLambda ? lambda : symbol;

            if (!transitionObject[key]) {
                transitionObject[key] = nextState;
            }
            else {
                const tempArr = [transitionObject[key]];
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
    })

    lambdaNFA();
}

function lambdaNFA() {
    const inputText = readline.question(`Enter a string: `);
    const input = inputText.split("");
 
    if (recursiveNFA(0, startState, new Set())) {
        console.log(`${inputText} was accepted`);
    }
    else {
        console.log(`${inputText} was not accepted`);
    }
 
    function recursiveNFA(currentIndex, currentState, visited) {
        const mapState = map.get(currentState) || {};
        
        if(mapState) {   
            const lambdaWays = mapState[lambda];
     
            if (lambdaWays) {
                const ways = Array.isArray(lambdaWays) ? lambdaWays : [lambdaWays];
     
                for (const way of ways) {
                    const key = `${currentIndex},${way}`;
    
                    if (!visited.has(key)) {
                        visited.add(key);
                        if (recursiveNFA(currentIndex, way, visited))
                            return true;
                    }
                }
            }
        }
 
        if (currentIndex === input.length) {
            return finalStates.has(currentState);
        }
 
        const possibleWays = mapState[input[currentIndex]];
 
        if (possibleWays && typeof possibleWays === "object") {
 
            for (const way of possibleWays) {
                const accepted = recursiveNFA(currentIndex + 1, way, new Set());
                if (accepted)
                    return true;
            }
 
            return false;
        }
        else {
            if (possibleWays == undefined)
                return false;
 
            return recursiveNFA(currentIndex + 1, possibleWays, new Set());
        }
    }
}

try {
    fs.readFile("dateLambda.in", "utf-8", (error, data) => (readData(error, data)));
}
catch(error) {
    console.error(error);
}