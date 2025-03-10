import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { HeaderMenus } from 'src/app/Models/header-menus.dto';
import { PostDTO } from 'src/app/Models/post.dto';
import { HeaderMenusService } from 'src/app/Services/header-menus.service';
import { LocalStorageService } from 'src/app/Services/local-storage.service';
import { PostService } from 'src/app/Services/post.service';
import { SharedService } from 'src/app/Services/shared.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
    posts!: PostDTO[];
    showButtons: boolean;
    listaFiltros: FormControl;
    search: FormControl;

    constructor( private postService: PostService, private localStorageService: LocalStorageService, private sharedService: SharedService,
        private router: Router, private headerMenusService: HeaderMenusService) {

        this.showButtons = false;
        this.search = new FormControl('');
        this.listaFiltros = new FormControl('title');
        this.loadPosts();
    }

    ngOnInit(): void {
        this.headerMenusService.headerManagement.subscribe((headerInfo: HeaderMenus) => {
            if (headerInfo) {
                this.showButtons = headerInfo.showAuthSection;
            }
        });
    }

    private async loadPosts(): Promise<void> {
        // TODO 2
        let errorResponse: any;
        const userId = this.localStorageService.get('user_id');
        if (userId) this.showButtons = true;
        try {
            this.posts = await this.postService.getPosts();            
        } catch (error: any) {
            errorResponse = error.error;
            this.sharedService.errorLog(errorResponse);
        }        
    }

    async like(postId: string): Promise<void> {
        let errorResponse: any;
        try {
            await this.postService.likePost(postId);
            this.loadPosts();
        } catch (error: any) {
            errorResponse = error.error;
            this.sharedService.errorLog(errorResponse);
        }
    }

    async dislike(postId: string): Promise<void> {
        let errorResponse: any;
        try {
            await this.postService.dislikePost(postId);
            this.loadPosts();
        } catch (error: any) {
            errorResponse = error.error;
            this.sharedService.errorLog(errorResponse);
        }
    }

    buscar(): any{
        this.posts.filter(pt => {
            const tipo = this.listaFiltros.value;
            switch(tipo){
                case "title": return pt.title == this.search.value;                
                case "description": return pt.description == this.search.value;
                case "publication_date": return pt.publication_date == this.search.value;
                default: return pt;
            }
        });
        console.log(this.posts);
        console.log("Buscar", this.search.value);
        console.log("lista", this.listaFiltros.value);
    }
}
