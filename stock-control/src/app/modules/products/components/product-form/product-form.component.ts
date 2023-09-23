import { MessageService } from 'primeng/api';
import { FormBuilder, Validators } from '@angular/forms';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { CategoriesService } from 'src/app/services/categories/categories.service';
import { Router } from '@angular/router';
import { GetCategoriesResponse } from 'src/app/models/interfaces/categories/responses/getCategoriesResponse';
import { CreateProductRequest } from 'src/app/models/interfaces/products/request/CreateProductRequest';
import { ProductsService } from 'src/app/services/products/products.service';

@Component({
  selector: 'app-product-form',
  templateUrl: './product-form.component.html',
  styleUrls: []
})
export class ProductFormComponent implements OnInit, OnDestroy {

  private readonly destroy$: Subject<void> = new Subject<void>();

  public selectedCategory: Array<{name:string, code:string }> = []
  public categoriesDatas: Array<GetCategoriesResponse> = []
  public addProductForm = this.FormBuilder.group({
    name: ['', Validators.required],
    price: ['', Validators.required],
    description: ['', Validators.required],
    category_id: ['', Validators.required],
    amount: [0, Validators.required],
  })

  constructor(
    private categoriesService: CategoriesService,
    private FormBuilder: FormBuilder,
    private messageService: MessageService,
    private productService: ProductsService,
    private router: Router
  ) { }
  ngOnInit(): void {
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
    if(this.addProductForm?.value && this.addProductForm?.valid ){
      const requestCreatePrdocut:CreateProductRequest = {
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
          this.messageService.add({ severity: 'success', summary: 'Sucesso', detail: 'Produto criado com sucesso' })
          this.router.navigate(['/products'])
        },
        error: (error) => {
          console.log(error)
          this.messageService.add({ severity: 'error', summary: 'Erro', detail: 'Erro ao criar produto' })
        }
      })

    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }



}
