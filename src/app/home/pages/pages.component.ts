import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { AuthService } from 'src/app/_services/auth.service';
import Swal from 'sweetalert2';
import { PagesService } from './pages.service';

@Component({
  selector: 'app-home-pages',
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.scss']
})
export class PagesComponent implements OnInit, OnChanges {

  @Input() type: string;
  typeCampo: string
  apiRota: string
  username: string

  produtos = []
  vendas = []
  recebimentos = []
  usuarios = []

  produtoJanela = false
  vendaJanela = false
  recebimentoJanela = false
  usuarioJanela = false

  swalOpcoes: any = Swal.mixin({
    customClass: {
      confirmButton: 'btn btn-success',
      cancelButton: 'btn btn-danger'
    },
    buttonsStyling: false
  })
  
  swalToast: any = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 5000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
    }
  })

  constructor(
    private authService: AuthService,
    private pagesService: PagesService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    switch (changes.type.currentValue) {
      case "produtos":
        this.typeCampo = "produto"
        this.apiRota = "product"
        this.loadProdutos()
        break;
      case "vendas":
        this.typeCampo = "venda"
        this.apiRota = "sale"
        this.loadVendas()
        break;
      case "recebimentos":
        this.typeCampo = "recebimento"
        this.apiRota = "receivement"
        this.loadRecebimentos()
        break;
      case "usuarios":
        this.typeCampo = "usuário"
        this.apiRota = "user"
        this.loadUsuarios()
        break;
    }
    let searchElement: any = document.getElementById('search')
    searchElement.value = '';
    
  }

  ngOnInit(): void {
    if (!localStorage.getItem('currentUser')) return this.authService.logout()
    this.username = localStorage.getItem('username');
  }

  search(event){
    let domUsuarios = document.querySelectorAll('.pesquisa')
    domUsuarios.forEach((element: HTMLElement ) => {
      if(element.textContent.toLowerCase().search(event.target.value.toLowerCase()) < 0){
        element.parentElement.style.display = 'none'
      } else{
        element.parentElement.style.display = ''
      }
    });
  }

  loadActual(){
    switch (this.type) {
      case "produtos":
        this.loadProdutos()
        break;
      case "vendas":
        this.loadVendas()
        break;
      case "recebimentos":
        this.loadRecebimentos()
        break;
      case "usuarios":
        this.loadUsuarios()
        break;
    }
  }

  showRecebimento(recebimento: any) : void {
    let text = ``;
    recebimento.products.forEach((ps) => { 
      text += `Produto: ${ps.product.name} - Quantidade: ${ps.quantity}</br>`
    })
    this.swalOpcoes.fire({
      title: `Recebimento #${recebimento.id}`,
      showCancelButton: false,
      html: text,
      confirmButtonText: 'Fechar'
    })
  }

  showVenda(venda: any) : void {
    let text = ``;
    text += `Preço: R$ ${venda.price}</br>`;
    text += `Cliente: ${venda.client_name}</br>`;
    venda.products.forEach((ps) => { 
      text += `Produto: ${ps.product.name} - Quantidade: ${ps.quantity}</br>`
    })
    this.swalOpcoes.fire({
      title: `Venda #${venda.id}`,
      showCancelButton: false,
      html: text,
      confirmButtonText: 'Fechar'
    })
  }

  deletar(id: any): void {
    this.swalOpcoes.fire({
      title: 'Tem certeza?',
      text: "Você não poderá reverter isso!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sim, deletar isso!',
      cancelButtonText: 'Não, cancelar!',
      reverseButtons: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.deleteItem(id)
        this.swalOpcoes.fire(
          'Deletado!',
          'Seu item foi deletado.',
          'success'
        ).then((result) => {
          if(result.isConfirmed){
            this.loadActual()
          }
        })
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        this.swalOpcoes.fire(
          'Cancelado!',
          'Seu item está seguro :)',
          'error'
        )
      }
    })
  }

  adicionar(){
    this.verificarModalAberto()
    switch (this.type) {
      case "produtos":
        this.produtoJanela = true
        break;
      case "vendas":
        this.vendaJanela = true
        break;
      case "recebimentos":
        this.recebimentoJanela = true
        break;
      case "usuarios":
        this.usuarioJanela = true
        break;
    }
  }

  nenhumItemEncontrado(){
    Swal.fire(
      'Nenhum item foi encontrado!',
      'Para adicionar um item, clique no botão verde "Adicionar"',
      'warning'
    )
  }

  deleteItem(id){
    this.pagesService.deleteItem(id, this.apiRota).subscribe()
  }

  loadProdutos(){
    this.pagesService.loadProdutos().subscribe(data => {
      this.produtos = data
      if (!data[0]){
        this.nenhumItemEncontrado()
      }
    })
  }

  loadVendas(){
    this.pagesService.loadVendas().subscribe(data => {
      this.vendas = data
      if (!data[0]){
        this.nenhumItemEncontrado()
      }
    })
  }

  loadRecebimentos(){
    this.pagesService.loadRecebimentos().subscribe(data => {
      this.recebimentos = data
      if (!data[0]){
        this.nenhumItemEncontrado()
      }
    })
  }

  loadUsuarios(){
    this.pagesService.loadUsuarios().subscribe(data => {
      this.usuarios = data
      if (!data[0]){
        this.nenhumItemEncontrado()
      }
    })
  }

  verificarModalAberto(){
    if(this.produtoJanela || this.vendaJanela || this.recebimentoJanela || this.usuarioJanela){
      this.produtoJanela = false
      this.vendaJanela = false
      this.recebimentoJanela = false
      this.usuarioJanela = false
    }
  }
}
