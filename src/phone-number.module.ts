import { NgModule, ModuleWithProviders } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TextMaskModule } from 'angular2-text-mask';

import { PhoneNumberComponent } from './phone-number.component';
import { CountryPipe } from './country.pipe';
import { CountryService } from './country.service';
import { PhoneMaskCursorProcessorDirective } from './phone.directive';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        TextMaskModule
    ],
    declarations: [
        PhoneNumberComponent,
        PhoneMaskCursorProcessorDirective,
        CountryPipe
    ],
    exports: [
        PhoneNumberComponent,
        CountryPipe
    ],
    providers: [CountryService]
})
export class InternationalPhoneNumber3Module {
  static forRoot(): ModuleWithProviders {
    return {
      ngModule: InternationalPhoneNumber3Module,
      providers: [CountryService]
    };
  }
}
