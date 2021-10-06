//song-list.component.ts
import { Component, OnInit } from '@angular/core';
import { Input } from '@angular/core';
import { Genres } from '../genres';

@Component({
  selector: 'app-song-list',
  templateUrl: './song-list.component.html',
  styleUrls: ['./song-list.component.css']
})
export class SongListComponent implements OnInit {

  @Input() songList: Genres[];

  constructor() { }
  ngOnInit() { }
}
