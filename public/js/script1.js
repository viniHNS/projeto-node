VMasker(document.querySelector("#telefone")).maskPattern("(99) 9999-9999");

let isNomeSet = false;
let isEmailSet = false;

document.querySelector("form").addEventListener("submit", (e) => {
    e.preventDefault();
});

document.querySelector("input[type='submit']").addEventListener("click", (e) => {
    if(document.querySelector("#nome").value == ""){
        document.querySelector("#nome").style.cssText = "border: 1px solid red;" 
        document.querySelector("#label-nome").style.cssText = "color:red;" 
        isNomeSet = false;
    }else{
        document.querySelector("#nome").removeAttribute("style");
        document.querySelector("#label-nome").removeAttribute("style");
        isNomeSet = true;
    }


    if(document.querySelector("#email").value == ""){
        document.querySelector("#email").style.cssText = "border: 1px solid red;" 
        document.querySelector("#label-email").style.cssText = "color:red;" 
        isEmailSet = false;
    }else{
        document.querySelector("#email").removeAttribute("style");
        document.querySelector("#label-email").removeAttribute("style");
        isEmailSet = true;
    }

    if(!isNomeSet || !isEmailSet){
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Preencha os campos obrigatórios!',
        });
    }

    if(isNomeSet && isEmailSet){
        document.querySelector("form").submit();
    }

});




