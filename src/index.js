const { response } = require("express");
const { request } = require("express");
const express = require("express");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(express.json());


// Creation account
const customers = [];
/*

    Data Account

    CPF - String
    Name - String
    ID - uuid
    statement []

*/

// Midleware
function verifyIfExistsAccountCPF(request, response, next){
     
    const { cpf } = request.headers;

    const customer = customers.find((customer) => customer.cpf === cpf); // Verification CPF account

    if(!customer){
        return response.status(400).json({ error: "Customer not found"})
    }

    request.customer = customer;
    
    return next();

};

// Function Get Balance
function getBalance(statement){

    const balance =  statement.reduce((acc, operation) => {
        if (operation.type === "credit"){
            return acc + operation.amount;
        } else {
            return acc - operation.amount;
        }
    }, 0);

};



// Creation account
app.post("/account", (request, response) => {
    
    const { cpf, name } = request.body;

    const customerAlreadyExists = customers.some((customer) => customer.cpf === cpf);

    if (customerAlreadyExists){
        return response.status(400).json({ error: "Customer Already Exists"}); // Verification CPF
    };

    customers.push({
        cpf,
        name,
        id: uuidv4(), // generation ID,
        statement: [],
    });

    return response.status(201).send();

});



// Search Account
app.get("/statement", verifyIfExistsAccountCPF, (request, response) => {
    const { customer } = request; 

    return response.json(customer.statement);

});



// Deposit
app.post("/deposit", verifyIfExistsAccountCPF, (request, response) => {
    
    const { description, amount } = request.body // verify description and amount value

    const { customer } = request;

    const statementOperation = {
        description,
        amount,
        created_at: new Date(),
        type: "credit"
    };

    customer.statement.push(statementOperation); 

    return response.status(201).send();

});



// Withdraw
app.post("/withdraw", verifyIfExistsAccountCPF, (request, response) =>{
    
    const { amount } = request.body;

    const { customer } = request;

    const balance = getBalance(customer.statement);

    if (balance < amount){
        return response.status(400).json({ error: "Insufficient Funds!" })
    }

    const statementOperation = {
        amount,
        created_at: new Date(),
        type: "debit"
    };

    customer.statement.push(statementOperation);

    return response.status(201).send();

});


app.listen(3333);