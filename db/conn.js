const mongoose = require("mongoose");

async function main(){
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/myDB", {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        console.log("Conectado com sucesso!")

    } catch (error) {
        console.log("Erro: " + error)
    }
}

module.exports = main;