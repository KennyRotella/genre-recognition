//detail.component.ts
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { ClassifierService } from '../../classifier.service';
import { Genres } from '../genres';
import * as Chart from 'chart.js';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css']
})
export class DetailComponent implements OnInit {

  private song: Genres;
  private labs = ['metal', 'disco', 'classical', 'hiphop', 'jazz', 'country', 'pop', 'blues', 'reggae', 'rock'];
  private borderColors = [
    'rgba(250, 9, 66, 1)',
    'rgba(167, 8, 171, 1)',
    'rgba(179, 214, 0, 1)',
    'rgba(158, 23, 231, 1)',
    'rgba(22, 1, 131, 1)',
    'rgba(79, 107, 38, 1)',
    'rgba(238, 233, 91, 1)',
    'rgba(9, 18, 229, 1)',
    'rgba(20, 215, 36, 1)',
    'rgba(236, 75, 56, 1)'];

  private bgColors = [
    'rgba(250, 9, 66, 0.6)',
    'rgba(167, 8, 171, 0.6)',
    'rgba(179, 214, 0, 0.6)',
    'rgba(158, 23, 231, 0.6)',
    'rgba(22, 1, 131, 0.6)',
    'rgba(79, 107, 38, 0.6)',
    'rgba(238, 233, 91, 0.6)',
    'rgba(9, 18, 229, 0.6)',
    'rgba(20, 215, 36, 0.6)',
    'rgba(236, 75, 56, 0.6)'];

  constructor(
    private classifierService: ClassifierService,
    private route: ActivatedRoute,
    private location: Location
  ) { }

  ngOnInit() {
    this.song = this.getSongByName();
    this.createBarChart();
    this.createLineCharts();
  }

  createLineCharts(){
    let labs = [];
    let secs = this.song.list[0].length*1.5;
    for(let i=1.5; i<=secs; i+=1.5)
      labs.push(i);
    
    let divElem = document.getElementById("lineCharts");
    for(let i=0; i<10; i++){
      let canvas = document.createElement("canvas");
      divElem.appendChild(canvas);
      let ctx = canvas.getContext('2d');
      let myChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: labs,
          datasets: [{
            label: this.labs[i],
            data: this.song.list[i],
            borderColor: this.borderColors[i],
            backgroundColor: this.bgColors[i],
            borderWidth: 1,
            fill: true,
            pointRadius: 0
          }]
        },
        options: {
          layout: {
            padding: {
                left: 50,
                right: 50,
                top: 0,
                bottom: 0
            }
          },
          scales: {
            xAxes: [{
              scaleLabel: {
                display: true,
                labelString: 'secondi'
              }
            }],
            yAxes: [{
              scaleLabel: {
                display: true,
                labelString: 'percentuale'
              },
              stacked: true
            }]
          },
          plugins: {
            filler: {
              propagate: false
            },
            'samples-filler-analyser': {
              target: 'chart-analyser'
            }
          }
        }
      });
    }
  }

  createBarChart(){
    let canvas : any = document.getElementById("barChart");
    let ctx = canvas.getContext('2d');
    let myChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.labs,
        datasets: [{
          label: 'Percentuale genere musicale',
          data: [
            this.song.metal,
            this.song.disco,
            this.song.classical,
            this.song.hiphop,
            this.song.jazz,
            this.song.country,
            this.song.pop,
            this.song.blues,
            this.song.reggae,
            this.song.rock
          ],
          borderColor: this.borderColors,
          backgroundColor: this.bgColors,
          borderWidth: 1
        }]
      },
      options: {
        layout: {
          padding: {
              left: 50,
              right: 50,
              top: 0,
              bottom: 0
          }
        },
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        }
      }
    });
  }

  getSongByName(): Genres{
    const name = this.route.snapshot.paramMap.get('name');
    return this.classifierService.getSongByName(name);
  }

  goBack(): void {
    this.location.back();
  }
}
