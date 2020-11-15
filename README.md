# CrispyScraper

Electron app that scrapes multiple sites and find the most relevant results


## Installation Directions

If npm isn't installed on your computer, install npm/node. 
[https://www.npmjs.com/get-npm]

unzip and move into the CrispyFinder-1.0.2 folder (With the README file) in your terminal using the cd command (ex. cd CrispyFinder-1.0.2) 

run "npm i" to install all the necessary dependencies

run "npm start" to launch the app.

in order to build the app and create an executable, run "npm i npm install electron-packager --save-dev"
[https://github.com/electron/electron-packager]

Then follow the instructions at the top of app.js:

comment out the testing code, uncomment code for building, and run "electron-packager ./ app-name"
  
try running a sample sequence like this one:
atgccgcgcgtcgtgcccgaccagagaagcaagttcgagaacgaggagttttttaggaagctgagccgcgagtgtgagattaagtacacgggcttcagggaccggccccacgaggaacgccaggcacgcttccagaacgcctgccgcgacggccgctcggaaatcgcttttgtggccacaggaaccaatctgtctctccagttttttccggccagctggcagggagaacagcgacaaacacctagccgagagtatgtcgacttagaaagagaagcaggcaaggtatatttgaaggctcccatgattctgaatggagtctgtgttatctggaaaggctggattgatctccaaagactggatggtatgggctgtctggagtttgatgaggagcgagcccagcaggaggatgcattagcacaacaggcctttgaagaggctcggagaaggacacgcgaatttgaagatagagacaggtctcatcgggaggaaatggaggcaagaagacaacaagaccctagtcctggttccaatttaggtggtggtgatgacctcaaacttcgttaa
