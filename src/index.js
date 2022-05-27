const { response } = require("express");
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
app.get("/statement/:cpf", (resquest, response) => {

    const { cpf } = resquest.params;

    const customer = customers.find(customer => customer.cpf === cpf); // Verification CPF account

    return response.json(customer.statement);

});



app.listen(3333);