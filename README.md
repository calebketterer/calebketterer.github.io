# Central Command

<strong>Welcome!</strong> This project contains multiple interactive links, visualizations, and games- all created by me.  
Visit the most recent deployment via Github Pages at [https://calebketterer.github.io/](https://calebketterer.github.io/).  
This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 18.2.4.

# Preview of Site

<img width="1490" height="746" alt="Screenshot 2026-10-16 at 9 26 11 PM" src="https://github.com/user-attachments/assets/1ccf80ca-07d6-48dd-ae28-2fe02467b05b" />

## Features

<details>
  <summary><strong>Diep</strong></summary>

## Diep

<img width="519" height="398" alt="image" src="https://github.com/user-attachments/assets/ddf6dbef-31c8-49ac-9416-549788aa0bc2" />

Based off the online game, Diep.io, I'm playing around with the idea of a single player version. The current version contains many enemies, an upgrade system, and achievement system. Not to mention a fun title screen with randomized effects and animations that I have guiltlessly admired for longer than I care to admit. 

</details>

<details>
  <summary><strong>Serpent</strong></summary>

## Serpent

<img width="380" height="638" alt="Screenshot 2026-10-17 at 10 13 50 AM" src="https://github.com/user-attachments/assets/f387de44-e593-48bb-a008-76fe379dad24" />

A sci fi take on the classic game of snake to match my site's theme that I may continue building off of in the future. 

</details>

<details>
  <summary><strong>Sudoku</strong></summary>

## Sudoku

<img width="321" height="682" alt="Screenshot 2026-10-17 at 10 14 20 AM" src="https://github.com/user-attachments/assets/9dbdcbc3-90e6-4393-97d5-e5fb6eeb62f2" />

Another simple classic, mostly hosted as a placeholder for the time being. 

</details>

## Development Server in Browser

Visit https://vscode.dev/. Log in to GitHub, then fork the repository. Under the explorer, select "Open Remote Repository" and select calebketterer.github.io. Open Terminal and click "Continue Working in GitHub Codespaces." Install ng with the command line `npm install -g @angular/cli` in the codespace Terminal. Run `ng serve` for a dev server. Type `o + enter` into Terminal to directly open this project in your browser.

## Deploying as a Github Page

If not already done, type `npm install -g angular-cli-ghpages` in terminal. Then, run `npm run deploy`, which executes `ng build --configuration production --base-href /` and  `npx angular-cli-ghpages --dir=dist/example-website/browser/`. After that, the site should be updated at `https://calebketterer.github.io/`

<details>
  <summary><strong>Misc Notes</strong></summary>

## Secondary Account Commands

When using a secondary account, commit under other creds by running `git config --global user.email calebketterer8@gmail.com`
and `git config --global user.name calebketterer`

## Commands for Returning App Trees (VSCODE Codespace/Linux)

When you want to see the full app tree, type `npm run apptree` in terminal and enter `npm run diepapptree` whenever you wanna see the diep file tree. The exact scripts being run are found in package.json.
