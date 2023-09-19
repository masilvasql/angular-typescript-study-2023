import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Subject, takeUntil } from 'rxjs';
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
    private messageService: MessageService
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

  ngOnDestroy(): void {
    this._destroyed$.next();
    this._destroyed$.complete();
  }

}
