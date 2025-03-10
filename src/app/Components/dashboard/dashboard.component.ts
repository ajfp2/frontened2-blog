import { Component } from '@angular/core';
import { PostDTO } from 'src/app/Models/post.dto';
import { PostService } from 'src/app/Services/post.service';
import { SharedService } from 'src/app/Services/shared.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {

    posts!: PostDTO[];
    total_likes = 0;
    total_dislikes = 0;
    constructor(private postService: PostService, private sharedService: SharedService){
        this.loadPosts();
    }

    private async loadPosts(): Promise<void> {
        // TODO 2
        let errorResponse: any;        
        try {
            this.posts = await this.postService.getPosts();
            this.posts.forEach(p =>{
                this.total_dislikes += p.num_dislikes;
                this.total_likes += p.num_likes;                
            });

        } catch (error: any) {
            errorResponse = error.error;
            this.sharedService.errorLog(errorResponse);
        }        
    }
}
