//classifier.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { Genres } from './components/genres';

@Injectable({ providedIn: 'root' })
export class ClassifierService {

  private serverUrl = 'http://localhost:5000';
  private songList: Genres[] = [];
  public inputDisabled: boolean = false;

  constructor(
    private http: HttpClient
  ) { }

  /** GET genres classification from the server 
  *   Input disabled until server respose
  */
  classify(song: File): void {
    var formData = new FormData();
    formData.append('file', song, song.name);

    this.inputDisabled = true;
    this.http.post<Genres>(this.serverUrl, formData)
      .pipe(
        tap(_ => console.log('Classificazione completata.')),
        catchError(this.handleError<Genres>('classify'))
      )
      .subscribe(genres =>{
      if(genres)
        this.songList.unshift(genres);
      this.inputDisabled = false;
    });

  }

  getSongs(): Genres[] {
    return this.songList;
  }

  getSongByName(name: string): Genres {
    var elem = this.songList.find(
      function(elem){
        return elem.nome == name;
      });
    return elem;
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T> (operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      console.error(error);
      this.inputDisabled = false;
      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }
}
