import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';
import { DeleteProductAction } from 'src/app/models/interfaces/products/event/DeleteProductAction';
import { EventAction } from 'src/app/models/interfaces/products/event/EventAction';
import { GetAllProductsResponse } from 'src/app/models/interfaces/products/response/GetAllProductsResponse';
import { ProductsService } from 'src/app/services/products/products.service';
import { ProductsDataTransferService } from 'src/app/shared/services/products/products-data-transfer.service';

@Component({
  selector: 'app-products-home',
  templateUrl: './products-home.component.html',
  styleUrls: []
})
export class ProductsHomeComponent implements OnInit, OnDestroy {


  private readonly _destroyed$: Subject<void> = new Subject();

  public productsDatas: Array<GetAllProductsResponse> = [];


  constructor(
    private productsService: ProductsService,
    private productsDataTransferService: ProductsDataTransferService,
    private router: Router,
    private messageService: MessageService,
    private confirmationService:ConfirmationService
  ) { }
  ngOnInit(): void {
    this.getServiceProductsDatas();
  }
  getServiceProductsDatas() {
    const productsLoaded = this.productsDataTransferService.getProductsDatas();
    if (productsLoaded.length > 0) {
      console.log(productsLoaded);
      this.productsDatas = productsLoaded;
    } else {
      this.getProductsDatas();
    }
  }
  getProductsDatas() {
    this.productsService.getAllProducts()
      .pipe(
        takeUntil(this._destroyed$)
      )
      .subscribe({
        next: (response) => {
          if (response.length > 0) {
            console.log("chamou o serviço", response);
            this.productsDatas = response;
            this.productsDataTransferService.setProductsDatas(response);
          }
        },
        error: (error) => {
          console.log(error);
          this.messageService.add(
            {
              severity: 'error',
              summary: 'Erro',
              detail: 'Error ao buscar os produtos',
              life: 3000
            }
          );
          this.router.navigate(['/dashboard']);
        }
      })
  }

  handleProductAction(event:EventAction): void {
    console.log(event);
  }

  handleDeleteProductAction(event:DeleteProductAction){
    this.confirmationService.confirm({
      message: `Deseja realmente excluir o produto ${event.product_name}?`,
      header: 'Confirmação de Exclusão',
      icon: 'pi pi-exclamation-triangle',
      acceptIcon: 'pi pi-check',
      rejectIcon: 'pi pi-times',
      acceptButtonStyleClass: 'p-button-success',
      rejectButtonStyleClass: 'p-button-danger',
      acceptLabel: 'Sim',
      rejectLabel: 'Não',
      accept: () => {
        this.deleteProduct(event.product_id);
      },
      reject: () => {
      }
    })
  }
  deleteProduct(product_id: string) {
    if(product_id){
      let response = this.productsService
      .deleteProduct(product_id)
      .pipe(
        takeUntil(this._destroyed$)
      ).subscribe({
        next: (response) => {
          if(response){
            this.messageService.add({
              severity: 'success',
              summary: 'Sucesso',
              detail: 'Produto excluído com sucesso',
              life: 3000
            });
            this.getProductsDatas();
          }
        },
        error: (error) => {
          console.log(error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erro',
            detail: 'Erro ao excluir o produto',
            life: 3000
          });
        }
      })
    }
  }

  ngOnDestroy(): void {
    this._destroyed$.next();
    this._destroyed$.complete();
  }

}
