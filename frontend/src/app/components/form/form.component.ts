//form.component.ts
import { Component, OnInit } from '@angular/core';
import { Genres } from '../genres';
import { ClassifierService } from '../../classifier.service';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit {

  songList: Genres[] = [];

  constructor(private classifierService: ClassifierService) { }

  ngOnInit() {
    this.songList = this.getSongs();
  }

  classify(files: File[]){
    this.classifierService.classify(files[0]);
  }

  getSongs(): Genres[] {
    return this.classifierService.getSongs();
  }

}
