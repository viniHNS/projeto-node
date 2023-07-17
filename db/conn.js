const mongoose = require("mongoose");
require("dotenv").config();

async function main(){
    try {
        await mongoose.connect(process.env.CONNECTION_STRING, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        
    } catch (error) {
        console.log("Erro: " + error)
    }
}

module.exports = main;