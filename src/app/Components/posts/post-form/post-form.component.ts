import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryDTO } from 'src/app/Models/category.dto';
import { PostDTO } from 'src/app/Models/post.dto';
import { CategoryService } from 'src/app/Services/category.service';
import { LocalStorageService } from 'src/app/Services/local-storage.service';
import { PostService } from 'src/app/Services/post.service';
import { SharedService } from 'src/app/Services/shared.service';

@Component({
  selector: 'app-post-form',
  templateUrl: './post-form.component.html',
  styleUrls: ['./post-form.component.scss'],
})
export class PostFormComponent implements OnInit {

    post: PostDTO;
    title: UntypedFormControl;
    description: UntypedFormControl;
    publication_date: UntypedFormControl;
    categories: UntypedFormControl;
    categoriesList!: CategoryDTO[];

    postForm: UntypedFormGroup;
    isValidForm: boolean | null;

    private isUpdateMode: boolean;
    private validRequest: boolean;
    private postId: string | null;

    constructor(
        private activatedRoute: ActivatedRoute,
        private postService: PostService,
        private formBuilder: UntypedFormBuilder,
        private router: Router,
        private sharedService: SharedService,
        private localStorageService: LocalStorageService,
        private categoryService: CategoryService
    ) {
        this.isValidForm = null;
        this.postId = this.activatedRoute.snapshot.paramMap.get('id');
        this.post = new PostDTO('', '', 0, 0, new Date());
        this.loadCategories();
        
        this.isUpdateMode = false;
        this.validRequest = false;

        this.title = new UntypedFormControl(this.post.title, [Validators.required, Validators.maxLength(55)]);
    
        this.description = new UntypedFormControl(this.post.description, [Validators.required, Validators.maxLength(255)]);
    
        this.publication_date = new UntypedFormControl(formatDate(this.post.publication_date, 'yyyy-MM-dd', 'en'), [Validators.required]);
        this.categories = new UntypedFormControl(this.post.categories, [Validators.required]);
    
        this.postForm = this.formBuilder.group({
            title: this.title,
            description: this.description,
            publication_date: this.publication_date,
            categories: this.categories
        });
    }

    // TODO 13
    async ngOnInit(): Promise<void> {
        let errorResponse: any;

        // update
        if (this.postId) {
            this.isUpdateMode = true;
            try {
                this.post = await this.postService.getPostById( this.postId );
                console.log(this.post);
                
                this.title.setValue(this.post.title);

                this.description.setValue(this.post.description);                

                this.publication_date.setValue(
                    formatDate(this.post.publication_date, 'yyyy-MM-dd', 'en')
                );
                let catsel = this.post.categories.map(it => it.categoryId);
                this.categories.setValue(catsel);

                this.postForm = this.formBuilder.group({
                    title: this.title,
                    description: this.description,
                    publication_date: this.publication_date,
                    categories: this.categories
                });
            } catch (error: any) {
                errorResponse = error.error;
                this.sharedService.errorLog(errorResponse);
            }
        }
    }

    private async loadCategories(): Promise<void> {    
        let errorResponse: any;
        const userId = this.localStorageService.get('user_id');
        if (userId) {
            try {
                this.categoriesList = await this.categoryService.getCategoriesByUserId(userId);                                

            } catch (error: any) {
                errorResponse = error.error;
                this.sharedService.errorLog(errorResponse);
            }
        }
    }

    private async editPost(): Promise<boolean> {
        let errorResponse: any;
        let responseOK: boolean = false;
        if (this.postId) {

          const userId = this.localStorageService.get('user_id');
          if (userId) {
            this.post.userId = userId;
            try {
                await this.postService.updatePost( this.postId, this.post );
                responseOK = true;
            } catch (error: any) {
                errorResponse = error.error;
                this.sharedService.errorLog(errorResponse);
            }
    
            await this.sharedService.managementToast(
                'postFeedback',
                responseOK,
                errorResponse
            );
    
            if (responseOK) {
              this.router.navigateByUrl('posts');
            }
          }
        }
        return responseOK;
      }
    
    private async createPost(): Promise<boolean> {
        let errorResponse: any;
        let responseOK: boolean = false;
        const userId = this.localStorageService.get('user_id');

        if (userId) {
            this.post.userId = userId;
            try {
                await this.postService.createPost(this.post);
                responseOK = true;
            } catch (error: any) {
                errorResponse = error.error;
                this.sharedService.errorLog(errorResponse);
            }

            await this.sharedService.managementToast( 'postFeedback', responseOK, errorResponse);
            if (responseOK) {
                this.router.navigateByUrl('posts');
            }
        }
    
        return responseOK;
    }
    
    async savePost() {
        this.isValidForm = false;

        if (this.postForm.invalid) {
            return;
        }

        this.isValidForm = true;
        this.post = this.postForm.value;
        console.log("POST", this.post);
        // TODO 10
        if(this.isUpdateMode == true){
            this.validRequest = await this.editPost();
        } else {
            this.validRequest = await this.createPost();
        }
    }
}
