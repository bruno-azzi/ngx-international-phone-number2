# ngx-international-phone-numberv3
A simple international telephone number input. Allows you to create a phone number field with country dropdown. 

This is re-re-written version (with enhancements and bug fixes) of [ngx-international-phone-number](https://github.com/nikhiln/ngx-international-phone-number) by [nikhiln](https://github.com/nikhiln), which was a re-written version of [ng4-intl-phone](https://github.com/kondi0/ng4-intl-phone/). So credit should go to [nikhiln](https://github.com/nikhiln) and [kondi0](https://github.com/kondi0).

## Enhancements

I discovered some problems with the ngx-international-phone-number library, prompting this updated version:

1 - The placeholder was not displayed unless you clear out the initial country code.

  - This has been fixed by separating the country dial code from the input.

2 - Non-numeric text could be pasted into the input.

  - This was fixed using a different directive.

3 - Clearing the country dial code or setting the cursor before the country dial code, then changing the country in the dropdown, the cursor would be inserted before the country code again, resulting in a mangled phone like "1234567890+1"

  - This has been fixed by separating the country dial code from the input.

4 - Since the country dial code was part of the input, the maxlength had to be adjusted to include it plus a space. However some country codes are 1 digit while others are not, so this could result in a phone input that couldn't fit all the desired digits or one that allowed too many digits.

  - This has been fixed by separating the country dial code from the input.

5 - There was no support for masking, for instance "111-111-1111".

  - This has been fixed by adding masking in above format (Note: for US and Canada numbers only)

6 - If defaultCountry was set true, existing phone values would have the country changed to that default country. The default country should apply only to new empty inputs.

7 - Added optional input to divide country code and phone number with a space (**countryCodeSpace** defaults to true)

8 - Added optional input to not prepend US phone numbers with country code (**noUSCountryCode** defaults to true)

9 - Added optional input to touch model upon every keystroke (previous behavior), otherwise only touch model when input is blurred or when phone becomes valid. This can help with parent error display to not show error as soon as typing is started on new number (**autoTouch** defaults to false)

10 - Make default country first in drop down list.

11 - As of v1.2.0, only US and Canada masked as 111-111-1111. Foreign numbers only enforce the numeric maxlength. As some counties have varying lengths and patterns (for instance Finland can have 5-12 digits). Now rely only on the underlying google-libphonenumber for validation. No visible masking done for foreign numbers.

## Installation

To install this library, run:

```bash
$ npm install ngx-international-phone-numberv3 --save
```

## Consuming your library

Once you have installed it you can import `InternationalPhoneNumberModule` from `ngx-international-phone-numberv3` in any application module. E.g.

```typescript
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';

// Import your library
import { InternationalPhoneNumber2Module } from 'ngx-international-phone-numberv3';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,

    // InternationalPhoneNumber2Module module
    InternationalPhoneNumber2Module
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }


```

As of v1.2.1 - flags sprite image was converted to a local image to remove dependency on CDN.
In your angular.json in the assets array, include the library's assets/images folder:
```typescript
{
  "glob": "**/*",
  "input": "node_modules/ngx-international-phone-numberv3/assets/images",
  "output": "./assets/images"
}
```

Once it is imported, you can use `international-phone-number2`:

```xml
<!-- app.component.html -->
<form name="sample-form" (ngSubmit)="submit()" #f="ngForm">
 <international-phone-number2 [(ngModel)]="model.phone_number" placeholder="Enter phone number" [defaultCountry]="'in'" [required]="true" #phoneNumber="ngModel" name="phone_number" [allowedCountries]="['in', 'ca', 'us']" ></international-phone-number2>

 <!-- sample error message -->
<div *ngIf="!phoneNumber.valid && !phoneNumber.pristine && !phoneNumber.untouched" class="has-error row">
    <span aria-hidden="true"><i class='fa fa-times-circle color-error'></i></span>
    <div *ngIf="phoneNumber.errors.required">Phone is required</div>
    <div *ngIf="phoneNumber.errors.pattern">Be sure to include the area code and 7-digit number</div>
</div>

  <div *ngIf="f.submitted && !phoneNumber.valid" class="help-block">Phone number is required and should be valid</div>
  <button type="submit">Submit</button>
</form>
```

### Attributes/Options:
    defaultCountryCode : An ISO 639-1 country code can be provided to set default country selected.
       
    placeholder: A placeholder text which would be displayed in input widget
    
    required: Indicates whether it is required or not
    
    allowDropdown: Indicates whether to allow selecting country from dropdown

    allowedCountries: A list of countries (iso codes) that would get display in country dropdown. E.g. [allowedCountries]="['in', 'ca', 'us']" would only show Canada, India and US. If not provided, all the countries would get displayed.

    pattern: Regex pattern to apply to input. Defaults to a regex that enforces 10 digit numeric input as "111-111-1111"
    
    countryCodeSpace: Boolean to add a space between country code and phone in model (defaults to true)

    noUSCountryCode: Boolean to suppress +1 country code for US numbers in model (defaults to true)

    autoTouch: Boolean to touch model upon each keystroke, otherwise touch model upon input blur or valid phone (defaults to false)

    maxlength: Maxlength enforced on foreign numbers (US or Canada enforce pattern 111-111-1111, defaults to 12).

## Troubleshooting:
If you are getting error "Can't resolve 'google-libphonenumber'" while building with aot, try to install google-libphonenumber. Run npm install google-libphonenumber@3.0.9 --save


## Authors
    * Original Author: kondi0, nikhiln
    * Author: esoyke

## License

MIT