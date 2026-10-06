# Control Center

<strong>Welcome!</strong> This project contains multiple interactive links, visualizations, and games- all created by me.  
Visit the most recent deployment via Github Pages at [https://calebketterer.github.io/](https://calebketterer.github.io/).  
This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.2.4.

## Features

<details>
  <summary><strong>Diep</strong></summary>

## Diep

<img width="519" height="398" alt="image" src="https://github.com/user-attachments/assets/ddf6dbef-31c8-49ac-9416-549788aa0bc2" />

Based off the online game, Diep.io, I'm playing around with the idea of a single player version. The current version contains many enemies, an upgrade system, and achievement system. Not to mention a fun title screen with randomized effects and animations that I have guiltlessly admired for longer than I care to admit. 

</details>

## Development Server in Browser

Visit https://vscode.dev/. Log in to GitHub, then fork the repository. Under the explorer, select "Open Remote Repository" and select Calebs Compendium. Open Terminal and click "Continue Working in GitHub Codespaces." Install ng with the command line `npm install -g @angular/cli` in the codespace Terminal. Run `ng serve` for a dev server. Type `o + enter` into Terminal to directly open this project in your browser.

<details>
  <summary><strong>Old Server Setup Instructions</strong></summary>
  
## Development Server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help with setup

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
</details>

## Deploying as a Github Page

If not already done, type `npm install -g angular-cli-ghpages` in terminal. Then, run `npm run deploy`, which executes `ng build --configuration production --base-href /` and  `npx angular-cli-ghpages --dir=dist/example-website/browser/`. After that, the site should be updated at `https://calebketterer.github.io/`

<details>
  <summary><strong>Misc Notes</strong></summary>

## Secondary Account Commands

When using a secondary account, commit under other creds by running `git config --global user.email calebketterer8@gmail.com`
and `git config --global user.name calebketterer`

## Commands for Returning App Trees (VSCODE Codespace/Linux)

When you want to see the full app tree, type `npm run apptree` in terminal and enter `npm run diepapptree` whenever you wanna see the diep file tree. The exact scripts being run are found in package.json.
