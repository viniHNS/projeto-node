function confirmarExclusao(e) {
  e.preventDefault();
  Swal.fire({
    title: 'Tem certeza?',
    text: "Você não poderá reverter isso!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'Sim, deletar!'
  }).then(async (result) => {
    if (result.isConfirmed) {
      await Swal.fire(
        'Deletado!',
        'O registro foi deletado.',
        'success'
      );
      e.target.closest('.form-consulta').submit();
    }
  });
}

const btnDeletarList = document.querySelectorAll('#btn-deletar');

btnDeletarList.forEach(btnDeletar => {
  btnDeletar.addEventListener('click', confirmarExclusao);
});




