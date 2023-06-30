VMasker(document.querySelector("#telefone")).maskPattern("(99) 9999-9999");

let isNomeSet = false;
let isEmailSet = false;
let clicked = false;

document.querySelector("form").addEventListener("submit", (e) => {
    e.preventDefault();
});



