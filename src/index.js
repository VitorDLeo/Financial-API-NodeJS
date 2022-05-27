const express = require("express");
const { v4: uuidv4 } = require("uuid");

const app = express();

app.use(express.json());

app.listen(3333);


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
    const id = uuidv4(); // generation ID

    customers.push({
        cpf,
        name,
        id,
        statement: []
    });

    return response.status(201).send();

});