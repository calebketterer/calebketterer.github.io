# Caleb's Virtual Compendium

<a href="https://YOUR-LINK-HERE.com">
  <img width="510" height="300" alt="Screenshot 2026-05-03 231029" src="https://github.com/user-attachments/assets/c784d64d-eecc-4ad1-a948-a7f3ab37d0da" />
</a>

---

<strong>Welcome!</strong> This project contains multiple interactive links, visualizations, and games- all created by me.  
Visit the most recent deployment via Github Pages at [https://calebketterer.github.io/Calebs-Compendium/](https://calebketterer.github.io/Calebs-Compendium/).  
This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.2.4.

## Features

<details>
  <summary><strong>Diep</strong></summary>

## Diep

<img width="519" height="398" alt="image" src="https://github.com/user-attachments/assets/ddf6dbef-31c8-49ac-9416-549788aa0bc2" />

Based off the online game, Diep.io, I'm playing around with the idea of a single player version. The current version contains many enemies, an upgrade system, and achievement system. Not to mention a fun title screen with randomized effects and animations that I have guiltlessly admired for longer than I care to admit. 

</details>

<details>
  <summary><strong>Snake</strong></summary>
  
## Snake

<img width="432" height="723" alt="2" src="https://github.com/user-attachments/assets/8af618a1-13cd-4370-bc8b-edbf00fd5e90" />

A classic game of Snake with the following features:

- Difficulty selection (Easy/Medium/Hard) that effects snake speed.
- Buttons to change direction and WASD support.
- A score that increases with each target consumed.
- An interactable title in the header.

Good luck with the Extreme difficulty!
</details>

<details>
  <summary><strong>Sudoku</strong></summary>
  
## Classic Sudoku
  
<img width="450" height="713" alt="Capture" src="https://github.com/user-attachments/assets/c96a5195-950d-4688-a4c0-f0d0bc14bb0f" />

A classic game of Sudoku, featuring the following:
  
- Interactive Sudoku board with keyboard and mouse support.
- "Check Answers" button with error highlighting.
- "Reveal Solution" toggle to view or hide the solution.
- Random puzzle generation with unique solutions.
- Difficulty selection (Easy/Medium/Hard).

Challenge yourself or practice your puzzle-solving skills!
</details>

<details>
  <summary><strong>Tetris</strong></summary>
  
## Tetris
  
<img width="496" height="730" alt="3" src="https://github.com/user-attachments/assets/9b8503f6-87f1-4f86-be04-f1c5feda1d0a" />

A classic game of Tetris, featuring the following:
  
- Interactive Tetris board with keyboard input.
- Scoreboard that adds 100 points with each row cleared.
- Next share preview.

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

If not already done, type `npm install -g angular-cli-ghpages` in terminal. Then, run `ng build --configuration production --base-href /Calebs-Compendium/` and  `npx angular-cli-ghpages --dir=dist/example-website/browser/`. After that, the site should be updated at `https://calebketterer.github.io/Calebs-Compendium/`

<details>
  <summary><strong>Misc Notes</strong></summary>

## Secondary Account Commands

When using a secondary account, commit under other creds by running `git config --global user.email calebketterer8@gmail.com`
and `git config --global user.name calebketterer`

## Commands for Returning App Trees (VSCODE Codespace/Linux)

When you want to see the full app tree, type `npm run apptree` in terminal and enter `npm run diepapptree` whenever you wanna see the diep file tree. The exact scripts being run are found in package.json.
