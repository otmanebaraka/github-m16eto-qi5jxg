import { Injectable, Signal, signal, effect, untracked } from '@angular/core';
import { Observable } from 'rxjs';

import { HttpClient } from '@angular/common/http';
import { ConditionsAndZip, CurrentConditions } from './types';
import { Forecast } from './forecasts-list/forecast.type';
import { LocationService } from './location.service';

@Injectable()
export class WeatherService {
  static URL = 'https://api.openweathermap.org/data/2.5';
  static APPID = '5a4b2d457ecbef9eb2a71e480b947604';
  static ICON_URL =
    'https://raw.githubusercontent.com/udacity/Sunshine-Version-2/sunshine_master/app/src/main/res/drawable-hdpi/';
  private currentConditions = signal<ConditionsAndZip[]>([]);

  constructor(
    private http: HttpClient,
    private locationService: LocationService
  ) {
    effect(
      () => {
        const locations = this.locationService.locations();
        untracked(() => {
          const currentZips = this.currentConditions().map(
            (condition) => condition.zip
          );
          // Remove conditions that are no longer in the locations list
          currentZips.forEach((zip) => {
            if (!locations.includes(zip)) {
              this.removeCurrentConditions(zip);
            }
          });

          // Add conditions for new locations
          locations.forEach((zip) => {
            if (!currentZips.includes(zip)) {
              this.addCurrentConditions(zip);
            }
          });
        });
      },
      { allowSignalWrites: true }
    );
  }

  addCurrentConditions(zipcode: string): void {
    // Here we make a request to get the current conditions data from the API. Note the use of backticks and an expression to insert the zipcode
    this.http
      .get<CurrentConditions>(
        `${WeatherService.URL}/weather?zip=${zipcode},us&units=imperial&APPID=${WeatherService.APPID}`
      )
      .subscribe((data) =>
        this.currentConditions.update((conditions) => [
          ...conditions,
          { zip: zipcode, data },
        ])
      );
  }

  removeCurrentConditions(zipcode: string) {
    this.currentConditions.update((conditions) => {
      for (let i in conditions) {
        if (conditions[i].zip == zipcode) conditions.splice(+i, 1);
      }
      return conditions;
    });
  }

  getCurrentConditions(): Signal<ConditionsAndZip[]> {
    return this.currentConditions.asReadonly();
  }

  getForecast(zipcode: string): Observable<Forecast> {
    // Here we make a request to get the forecast data from the API. Note the use of backticks and an expression to insert the zipcode
    return this.http.get<Forecast>(
      `${WeatherService.URL}/forecast/daily?zip=${zipcode},us&units=imperial&cnt=5&APPID=${WeatherService.APPID}`
    );
  }

  getWeatherIcon(id): string {
    if (id >= 200 && id <= 232)
      return WeatherService.ICON_URL + 'art_storm.png';
    else if (id >= 501 && id <= 511)
      return WeatherService.ICON_URL + 'art_rain.png';
    else if (id === 500 || (id >= 520 && id <= 531))
      return WeatherService.ICON_URL + 'art_light_rain.png';
    else if (id >= 600 && id <= 622)
      return WeatherService.ICON_URL + 'art_snow.png';
    else if (id >= 801 && id <= 804)
      return WeatherService.ICON_URL + 'art_clouds.png';
    else if (id === 741 || id === 761)
      return WeatherService.ICON_URL + 'art_fog.png';
    else return WeatherService.ICON_URL + 'art_clear.png';
  }
}
