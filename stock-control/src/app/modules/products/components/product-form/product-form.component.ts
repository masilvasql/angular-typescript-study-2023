import { MessageService } from 'primeng/api';
import { FormBuilder, Validators } from '@angular/forms';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { CategoriesService } from 'src/app/services/categories/categories.service';
import { Router } from '@angular/router';
import { GetCategoriesResponse } from 'src/app/models/interfaces/categories/responses/getCategoriesResponse';
import { CreateProductRequest } from 'src/app/models/interfaces/products/request/CreateProductRequest';
import { ProductsService } from 'src/app/services/products/products.service';
import { DynamicDialogConfig } from 'primeng/dynamicdialog';
import { EventAction } from 'src/app/models/interfaces/products/event/EventAction';
import { GetAllProductsResponse } from 'src/app/models/interfaces/products/response/GetAllProductsResponse';
import { ProductsDataTransferService } from 'src/app/shared/services/products/products-data-transfer.service';
import { ProductEvent } from 'src/app/models/enums/products/products.event';
import { EditProductRequest } from 'src/app/models/interfaces/products/request/EditProductRequest';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: []
})
export class ProductFormComponent implements OnInit, OnDestroy {

  private readonly destroy$: Subject<void> = new Subject<void>();

  public selectedCategory: Array<{ name: string, code: string }> = []
  public categoriesDatas: Array<GetCategoriesResponse> = []
  public productAction!: {
    event: EventAction,
    productDatas: Array<GetAllProductsResponse>
  }
  public productSelectedData: GetAllProductsResponse | undefined
  public productDatas: Array<GetAllProductsResponse> = []
  public addProductForm = this.FormBuilder.group({
    name: ['', Validators.required],
    price: ['', Validators.required],
    description: ['', Validators.required],
    category_id: ['', Validators.required],
    amount: [0, Validators.required],
  })

  public editProductForm = this.FormBuilder.group({
    name: ['', Validators.required],
    price: ['', Validators.required],
    description: ['', Validators.required],
    amount: [0, Validators.required],
  })

  public addProductAction = ProductEvent.ADD_PRODUCT_EVENT
  public editProductAction = ProductEvent.EDIT_PRODUCT_EVENT
  public saleProductAction = ProductEvent.SALE_PRODUCT_EVENT

  constructor(
    private categoriesService: CategoriesService,
    private FormBuilder: FormBuilder,
    private messageService: MessageService,
    private productService: ProductsService,
    private router: Router,
    private ref: DynamicDialogConfig,
    private productDataTransferService: ProductsDataTransferService
  ) { }
  ngOnInit(): void {
    this.productAction = this.ref.data
    if (this.productAction.event.action === ProductEvent.EDIT_PRODUCT_EVENT && this.productAction.productDatas.length > 0) {
      this.getProductSelectedData(this.productAction?.event?.id as string)
    }

    if (this.productAction.event.action === this.saleProductAction) {
      this.getProductData()
    }

    this.getAllCategories()
  }
  getAllCategories() {
    this.categoriesService.getAllCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: GetCategoriesResponse[]) => {
          if (response.length > 0) {
            this.categoriesDatas = response
          }
        },
        error: (error) => {
          console.log(error)
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao buscar categorias' })
        }
      })
  }

  handleSubmitAddProduct(): void {
    if (this.addProductForm?.value && this.addProductForm?.valid) {

      const requestCreatePrdocut: CreateProductRequest = {
        name: this.addProductForm.value.name as string,
        price: this.addProductForm.value.price as string,
        description: this.addProductForm.value.description as string,
        category_id: this.addProductForm.value.category_id as string,
        amount: Number(this.addProductForm.value.amount)
      }
      this.productService.createProduct(requestCreatePrdocut)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            // clear form
            this.addProductForm.reset()
            this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Produto criado com sucesso' })
          },
          error: (error) => {
            console.log(error)
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao criar produto' })
          }
        })

    }
  }

  handleSubmitEditProduct(): void {
    if (this.editProductForm.value && this.editProductForm.valid) {
      const editProductRequest: EditProductRequest = {
        product_id: this.productAction?.event.id as string,
        name: this.editProductForm.value.name as string,
        price: this.editProductForm.value.price as string,
        description: this.editProductForm.value.description as string,
        amount: Number(this.editProductForm.value.amount)
      }
      this.productService.editProduct(editProductRequest)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Produto editado com sucesso' })

            this.editProductForm.reset()
          },
          error: (error) => {
            console.log(error)
            this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao editar produto' })
          }
        })
    }
  }

  getProductSelectedData(product_id: string): void {
    const allProducts = this.productAction?.productDatas
    if (allProducts.length > 0) {
      const productFiltered = allProducts.filter((product) => product.id === product_id)
      if (productFiltered) {
        this.productSelectedData = productFiltered[0]
        this.editProductForm.setValue({
          name: this.productSelectedData.name,
          price: this.productSelectedData.price,
          description: this.productSelectedData.description,
          amount: this.productSelectedData.amount
        })
      }
    }
  }

  getProductData(): void {
    this.productService.getAllProducts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          if (response.length > 0) {
            this.productDatas = response
            this.productDataTransferService.setProductsDatas(response)
          }
        },
        error: (error) => {
          console.log(error)
        }
      })
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }



}
