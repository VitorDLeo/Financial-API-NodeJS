const { response } = require("express");// Import Express response
const { request } = require("express"); // Import Express require
const express = require("express"); // Import Express
const { v4: uuidv4 } = require("uuid"); // Create a unique user ID

const app = express(); // Inserting the Express inside the "app" variable
app.use(express.json());


// Creation account
// Customer parameters and fields
const customers = [];
/*

    Data Account

    CPF - String
    Name - String
    ID - uuid (Generated via UUID)
    statement []

*/


// Midleware
// It has the function of checking if the customer's CPF is already registered
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
// It has the function of verifying which type of transaction in the statement was made,
// and generating the current value of the user's account
function getBalance(statement){

    const balance =  statement.reduce((acc, operation) => {
        if (operation.type === "credit"){
            return acc + operation.amount; // If a credit operation has been carried out, it adds the amount to the account
        } else {
            return acc - operation.amount; // If a debit operation has been made, it removes the amount from the account
        }
    }, 0);

};


// Creation account
// Post method for creating the Customer
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


// Consulting transfers
app.get("/statement/date", verifyIfExistsAccountCPF, (request, response) => {
    
    const { customer } = request; 
    const { date } = request.query;

    const dateFormat = new Date(date + " 00:00");

    const statement = customer.statement.filter((statement) => statement.created_at.toDateString() === new Date(dateFormat).toDateString());

    return response.json(statement);

});


// Change of registration data
app.put("/account", verifyIfExistsAccountCPF, (request, response) => {

    const { name } = request.body;
    const { customer } = request;

    customer.name = name;

    return response.status(201).send();

});


// Search Customer
app.get("/account", verifyIfExistsAccountCPF, (request, response) =>{

    const { customer } = request;

    return response.json(customer);

});


// Delete Account
app.delete("/account", verifyIfExistsAccountCPF, (request, response) => {

    const { customer } = request;

    //splice

    customers.splice(customer, 1);

    return response.status(200).json(customers);

});

// look up the current value in the customer's account 
app.get("/balance", verifyIfExistsAccountCPF, (request, response) =>{

    const { customer } = request

    const balance = getBalance(customer.statement);

    return response.json(balance);

});


app.listen(3333); // Socket WebServer https://localhosto:3333
