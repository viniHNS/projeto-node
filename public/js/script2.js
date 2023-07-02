VMasker(document.querySelector("#dataNascimento")).maskPattern("99/99/9999");

let isNomeSet = false;
let isDataNascimentoSet = false;
let isSexoSet = false;
let isPeriodoEstudoSet = false;
let isResponsavelNomeSet = false;

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

    if(document.querySelector("#dataNascimento").value == ""){
        document.querySelector("#dataNascimento").style.cssText = "border: 1px solid red;" 
        document.querySelector("#label-dataNascimento").style.cssText = "color:red;" 
        isDataNascimentoSet = false;
    }else{
        document.querySelector("#dataNascimento").removeAttribute("style");
        document.querySelector("#label-dataNascimento").removeAttribute("style");
        isDataNascimentoSet = true;
    }

    if(document.querySelector("#sexo").checked == false){
        document.querySelector("#label-sexo").style.cssText = "color:red;"
        document.querySelector(".radio-sexo-masculino").style.cssText = "color:red;"
        document.querySelector(".radio-sexo-feminino").style.cssText = "color:red;"
        isSexoSet = false;
    }else{
        document.querySelector("#label-sexo").removeAttribute("style");
        document.querySelector(".radio-sexo-masculino").removeAttribute("style");
        document.querySelector(".radio-sexo-feminino").removeAttribute("style");
        isSexoSet = true;
    }

    if(document.querySelector("#periodoEstudo").value == ""){
        document.querySelector("#periodoEstudo").style.cssText = "border: 1px solid red;" 
        document.querySelector("#label-periodoEstudo").style.cssText = "color:red;" 
        isPeriodoEstudoSet = false;
    }else{
        document.querySelector("#periodoEstudo").removeAttribute("style");
        document.querySelector("#label-periodoEstudo").removeAttribute("style");
        isPeriodoEstudoSet = true;
    }

    if(document.querySelector("#nomeResponsavel").value == ""){
        document.querySelector("#nomeResponsavel").style.cssText = "border: 1px solid red;" 
        document.querySelector("#label-nomeResponsavel").style.cssText = "color:red;" 
        isResponsavelNomeSet = false;
    }else{
        document.querySelector("#nomeResponsavel").removeAttribute("style");
        document.querySelector("#label-nomeResponsavel").removeAttribute("style");
        isResponsavelNomeSet = true
    }

    if(!isNomeSet || !isDataNascimentoSet || !isSexoSet || !isPeriodoEstudoSet || !isResponsavelNomeSet){
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Preencha os campos obrigatórios!',
        });
    }

    if(isNomeSet && isDataNascimentoSet && isSexoSet && isPeriodoEstudoSet && isResponsavelNomeSet){
        document.querySelector("form").submit();
    }
});

