function setup(client, room, shared, my, participants, qdata) {
  const waitScreen = document.querySelector('#waitScreen'); //game grid for p1
  const gameScreen = document.querySelector('#gameScreen'); //game grid for p2

  const p1Grid = document.querySelector('.grid-p1'); //game grid for p1
  const p2Grid = document.querySelector('.grid-p2'); //game grid for p2

  const displayGrid1 = document.querySelector('.p1-grid-display'); //displays ships at the beginning for p1
  const displayGrid2 = document.querySelector('.p2-grid-display'); //displays ships at the beginning for p2
  const overlay1 = document.querySelector('.overlay1'); //displays ships at the beginning for p2
  const overlay2 = document.querySelector('.overlay2'); //displays ships at the beginning for p2

  const gameInfo = document.querySelector('#game-set-up'); //displays ships at the beginning for p2

  const ships = document.querySelectorAll('.ship'); //every ship
  const shipNames = ['destroyer', 'submarine', 'cruiser', 'battleship', 'carrier'];

  const destroyer1 = document.querySelector('.p1-destroyer-container');
  const submarine1 = document.querySelector('.p1-submarine-container');
  const cruiser1 = document.querySelector('.p1-cruiser-container');
  const battleship1 = document.querySelector('.p1-battleship-container');
  const carrier1 = document.querySelector('.p1-carrier-container');
  const p1Ships = [destroyer1, submarine1, cruiser1, battleship1, carrier1];


  const destroyer2 = document.querySelector('.p2-destroyer-container');
  const submarine2 = document.querySelector('.p2-submarine-container');
  const cruiser2 = document.querySelector('.p2-cruiser-container');
  const battleship2 = document.querySelector('.p2-battleship-container');
  const carrier2 = document.querySelector('.p2-carrier-container');
  const p2Ships = [destroyer2, submarine2, cruiser2, battleship2, carrier2];

  //we need to change this so that anyone beyond p2 is a viewer
  if(room.getHostName() === client.getUid()){ //checks whether you are host aka player 1
    displayGrid2.style.opacity = 0; //can't see/move opponents ships
    displayGrid2.style.display = "none"; 
    gameInfo.style.right="100px"; 
    gameInfo.style.top="120px";
    p2Grid.style.opacity = 0; //can't see opponents grid
    //console.log('you host')
  }else{ //checks whether you are player 2
    displayGrid1.style.opacity = 0; //can't see/move opponents ships
    displayGrid1.style.display = "none"; 
    gameInfo.style.top="120px";
    gameInfo.style.left="100px"; 
    p1Grid.style.opacity = 0; //can't see opponents grid
    //console.log('you not host');
  }

  let participNum = 0;
  setInterval(() => {
    participNum = 0;
    participants.forEach(()=>{
      participNum++; 
    }); checkParticipCount();
  }, 1000);
  function checkParticipCount(){
    if(participNum<2){
      waitScreen.style.display="block";
      gameScreen.style.display="none"
    }
    else{
      gameScreen.style.display="block";
      waitScreen.style.display="none"
    }
    }
  const startButton = document.querySelector('#start');
  const entangleButton = document.querySelector('#entangle');
  const rotateButton = document.querySelector('#rotate');

  //button presets
  rotateButton.style.display="relative"; //show button in view
  entangleButton.style.display="relative"; 
  startButton.style.opacity="0%"; //remove button from view
  startButton.style.position="absolute";
  startButton.style.bottom="0"; //push to bottom of screen

  //const whichPlayerDisplay = document.querySelector('#who-you');
  const turnDisplay = document.querySelector('#whose-go');
  const infoDisplay = document.querySelector('#info');
  //const chooseTeam = document.querySelector('#chooseteam');


  let p1Squares = [];
  let p2Squares = [];

  let terrain = [];
  let p1CurrentMap = [[], []];
  let p2CurrentMap = [[], []];

  let isHorizontal = true;
  let isGameOver = false;

  //All shared variables
  shared.p1placed = [false, false, false, false, false];
  shared.p2placed = [false, false, false, false, false];
  shared.p1ShipsPos = [[],[],[],[],[]];
  shared.p2ShipsPos = [[],[],[],[],[]];
  shared.entangledPoints = [[], []];
  shared.entangledPos = [[], []];
  shared.entangledCount = 0;
  shared.p1SquareStates = [];
  shared.p2SquareStates = [];
  shared.startCount = 0;
  shared.currentPlayer = 'p1';


  //setting current turn to p1
  if(room.getHostName() === client.getUid()) {
    shared.currentTurn = "Player1";
  }
  shared.currentTurn = shared.currentTurn || "Player1"; //we might not need this

  // setInterval(() => {
  //   console.log(shared);
  // }, 1000);

  let totalShipCount = 2; //CHANGE TO 10 IN THE END
  const width = 16; //number of cells 

  // qdata.shots.forEach((q) => {
  //   console.log(q);
  // });
  //console.log(qdata.shots[0]);

  for(var q=0; q<512; q++){
    if(qdata.shots[q] == '11'){
        terrain.push(false);
    }else{
        terrain.push(true);
    }
  }
  //console.log(terrain);

  //Create Board fn
  function createBoard(grid, squares, pname, states) {
    for (let i = 0; i < width*width; i++) {
      const square = document.createElement('div');
      if(pname == 'p1'){
        square.dataset.id = i;

        if(terrain[i]){
          square.classList.add("land");
          p1CurrentMap[0].push(i);
        }else{
          square.classList.add("waste");
          p1CurrentMap[1].push(i);
        }
      }else if(pname == 'p2'){
        square.dataset.id = width*width + i;

        if(terrain[i + width*width]){
          square.classList.add("land");
          p2CurrentMap[0].push(width*width + i);
        }else{
          square.classList.add("waste");
          p2CurrentMap[1].push(width*width + i);
        }
      }  
      //square.classList.add("land");
      grid.appendChild(square);
      squares.push(square);
      states.push('false');
    }
  }
  createBoard(p1Grid, p1Squares, 'p1', shared.p1SquareStates); //board for p1
  createBoard(p2Grid, p2Squares, 'p2', shared.p2SquareStates); //board for p2
  //shared.p1SquareStates[1].push(p1CurrentMap);
  //shared.p2SquareStates[1].push(p2CurrentMap);

  //console.log(p1Squares);
  //console.log("printing shared", shared);

  //Rotate the ships
  function rotate() {
    if (isHorizontal) {
      destroyer1.classList.toggle('p1-destroyer-container-vertical');
      submarine1.classList.toggle('p1-submarine-container-vertical');
      cruiser1.classList.toggle('p1-cruiser-container-vertical');
      battleship1.classList.toggle('p1-battleship-container-vertical');
      carrier1.classList.toggle('p1-carrier-container-vertical');
      destroyer2.classList.toggle('p2-destroyer-container-vertical');
      submarine2.classList.toggle('p2-submarine-container-vertical');
      cruiser2.classList.toggle('p2-cruiser-container-vertical');
      battleship2.classList.toggle('p2-battleship-container-vertical');
      carrier2.classList.toggle('p2-carrier-container-vertical');
      isHorizontal = false;
      //console.log(isHorizontal);
      return;
    }
    if (!isHorizontal) {
      destroyer1.classList.toggle('p1-destroyer-container-vertical');
      submarine1.classList.toggle('p1-submarine-container-vertical');
      cruiser1.classList.toggle('p1-cruiser-container-vertical');
      battleship1.classList.toggle('p1-battleship-container-vertical');
      carrier1.classList.toggle('p1-carrier-container-vertical');
      destroyer2.classList.toggle('p2-destroyer-container-vertical');
      submarine2.classList.toggle('p2-submarine-container-vertical');
      cruiser2.classList.toggle('p2-cruiser-container-vertical');
      battleship2.classList.toggle('p2-battleship-container-vertical');
      carrier2.classList.toggle('p2-carrier-container-vertical');
      isHorizontal = true;
      //console.log(isHorizontal);
      return;
    }
  }
  rotateButton.addEventListener('click', rotate);






/////////////////////////////////////////////////////////////////////// DRAG EVENT LISTENERS





  //console.log(p2Squares);
  let selectedShipNameWithIndex;
  let draggedShip;
  let draggedShipLength;
  let numberOfShipsDropped = 0;

  ships.forEach(ship => ship.addEventListener('dragstart', dragStart));
  p1Squares.forEach(square => square.addEventListener('dragstart', dragStart));
  p1Squares.forEach(square => square.addEventListener('dragover', dragOver));
  p1Squares.forEach(square => square.addEventListener('dragenter', dragEnter));
  p1Squares.forEach(square => square.addEventListener('dragleave', dragLeave))
  p1Squares.forEach(square => square.addEventListener('drop', p1DragDrop));
  p1Squares.forEach(square => square.addEventListener('dragend', dragEnd));
  p2Squares.forEach(square => square.addEventListener('dragstart', dragStart));
  p2Squares.forEach(square => square.addEventListener('dragover', dragOver));
  p2Squares.forEach(square => square.addEventListener('dragenter', dragEnter));
  p2Squares.forEach(square => square.addEventListener('dragleave', dragLeave));
  p2Squares.forEach(square => square.addEventListener('drop', p2DragDrop));
  p2Squares.forEach(square => square.addEventListener('dragend', dragEnd));


  ships.forEach(ship => ship.addEventListener('mousedown', (e) => {
      selectedShipNameWithIndex = e.target.id;
  }))

  function dragStart() {
      draggedShip = this;
      draggedShipLength = this.childNodes.length;
      //console.log(shared);
  }

  function dragOver(e) {
      e.preventDefault();
  }

  function dragEnter(e) {
      e.preventDefault();
  }

  function dragLeave() {
      //console.log('drag leave');
  }

  function calculateHoriBounds(dist, player){
    let bounds = [];
    if(player == 'p1') {
      for (let b = 0; b < dist; b++) {
        for (let i = 15 - b; i < 256; i+=16) {
          bounds.push(i);
        }
      }
    }else if(player == 'p2'){
      for (let b = 0; b < dist; b++) {
        for (let i = 271 - b; i < 512; i+=16) {
          bounds.push(i);
        }
      }
    }

    return bounds;
  }

  function calculateVertBounds(dist, player){
    let bounds = [];
    if(player == 'p1') {
      for (let i = 255; i > (255 - (16 * dist)); i--) {
        bounds.push(i);
      }
    }else if(player == 'p2'){
      for (let i = 511; i > (511 - (16 * dist)); i--) {
        bounds.push(i);
      }
    }
    return bounds;
  }

  function addTerrainBounds(player, ship, isHorizontal){
    let notTerrain = [];

    if(player == 'p1'){
      if(isHorizontal){
        if(ship == 'destroyer'){
          p1CurrentMap[1].forEach((s) => {
            p1horiBounds[0].push(s);
          });
          p1CurrentMap[0].forEach((s) => {
            if(!(p1CurrentMap[0].includes(s+1))){
              notTerrain.push(s);
            }
          });
        }else if(ship == 'submarine'){
          p1CurrentMap[0].forEach((s) => {
            p1horiBounds[1].push(s);
          });
          p1CurrentMap[1].forEach((s) => {
            if(!(p1CurrentMap[1].includes(s+1) && p1CurrentMap[1].includes(s+2))){
              notTerrain.push(s);
            }
          });
        }else if(ship == 'cruiser'){
          p1CurrentMap[1].forEach((s) => {
            p1horiBounds[2].push(s);
          });
          p1CurrentMap[0].forEach((s) => {
            if(!(p1CurrentMap[0].includes(s+1) && p1CurrentMap[0].includes(s+2))){
              notTerrain.push(s);
            }
          });
        }else if(ship == 'battleship'){
          p1CurrentMap[0].forEach((s) => {
            p1horiBounds[3].push(s);
          });
          p1CurrentMap[1].forEach((s) => {
            if(!(p1CurrentMap[1].includes(s+1) && p1CurrentMap[1].includes(s+2) && p1CurrentMap[1].includes(s+3))){
              notTerrain.push(s);
            }
          });
        }else if(ship == 'carrier'){
          p1CurrentMap[1].forEach((s) => {
            p1horiBounds[4].push(s);
          });
          p1CurrentMap[0].forEach((s) => {
            if(!(p1CurrentMap[0].includes(s+1) && p1CurrentMap[0].includes(s+2) && p1CurrentMap[0].includes(s+3) && p1CurrentMap[0].includes(s+4))){
              notTerrain.push(s);
            }
          });
        }
      } else if (!isHorizontal){
        if(ship == 'destroyer'){
          p1CurrentMap[1].forEach((s) => {
            p1vertBounds[0].push(s);
          });
          p1CurrentMap[0].forEach((s) => {
            if(!(p1CurrentMap[0].includes(s+16))){
              notTerrain.push(s);
            }
          });
        }else if(ship == 'submarine'){
          p1CurrentMap[0].forEach((s) => {
            p1vertBounds[1].push(s);
          });
          p1CurrentMap[1].forEach((s) => {
            if(!(p1CurrentMap[1].includes(s+16) && p1CurrentMap[1].includes(s+32))){
              notTerrain.push(s);
            }
          });
        }else if(ship == 'cruiser'){
          p1CurrentMap[1].forEach((s) => {
            p1vertBounds[2].push(s);
          });
          p1CurrentMap[0].forEach((s) => {
            if(!(p1CurrentMap[0].includes(s+16) && p1CurrentMap[0].includes(s+32))){
              notTerrain.push(s);
            }
          });
        }else if(ship == 'battleship'){
          p1CurrentMap[0].forEach((s) => {
            p1vertBounds[3].push(s);
          });
          p1CurrentMap[1].forEach((s) => {
            if(!(p1CurrentMap[1].includes(s+16) && p1CurrentMap[1].includes(s+32) && p1CurrentMap[1].includes(s+48))){
              notTerrain.push(s);
            }
          });
        }else if(ship == 'carrier'){
          p1CurrentMap[1].forEach((s) => {
            p1vertBounds[4].push(s);
          });
          p1CurrentMap[0].forEach((s) => {
            if(!(p1CurrentMap[0].includes(s+16) && p1CurrentMap[0].includes(s+32) && p1CurrentMap[0].includes(s+48) && p1CurrentMap[0].includes(s+64))){
              notTerrain.push(s);
            }
          });
        }
      }
    }else if(player == 'p2'){
      if(isHorizontal){
        if(ship == 'destroyer'){
          p2CurrentMap[1].forEach((s) => {
            p2horiBounds[0].push(s);
          });
          p2CurrentMap[0].forEach((s) => {
            if(!(p2CurrentMap[0].includes(s+1))){
              notTerrain.push(s);
            }
          });
        }else if(ship == 'submarine'){
          p2CurrentMap[0].forEach((s) => {
            p2horiBounds[1].push(s);
          });
          p2CurrentMap[1].forEach((s) => {
            if(!(p2CurrentMap[1].includes(s+1) && p2CurrentMap[1].includes(s+2))){
              notTerrain.push(s);
            }
          });
        }else if(ship == 'cruiser'){
          p2CurrentMap[1].forEach((s) => {
            p2horiBounds[2].push(s);
          });
          p2CurrentMap[0].forEach((s) => {
            if(!(p2CurrentMap[0].includes(s+1) && p2CurrentMap[0].includes(s+2))){
              notTerrain.push(s);
            }
          });
        }else if(ship == 'battleship'){
          p2CurrentMap[0].forEach((s) => {
            p2horiBounds[3].push(s);
          });
          p2CurrentMap[1].forEach((s) => {
            if(!(p2CurrentMap[1].includes(s+1) && p2CurrentMap[1].includes(s+2) && p2CurrentMap[1].includes(s+3))){
              notTerrain.push(s);
            }
          });
        }else if(ship == 'carrier'){
          p2CurrentMap[1].forEach((s) => {
            p2horiBounds[4].push(s);
          });
          p2CurrentMap[0].forEach((s) => {
            if(!(p2CurrentMap[0].includes(s+1) && p2CurrentMap[0].includes(s+2) && p2CurrentMap[0].includes(s+3) && p2CurrentMap[0].includes(s+4))){
              notTerrain.push(s);
            }
          });
        }
      } else if (!isHorizontal){
        if(ship == 'destroyer'){
          p2CurrentMap[1].forEach((s) => {
            p2vertBounds[0].push(s);
          });
          p2CurrentMap[0].forEach((s) => {
            if(!(p2CurrentMap[0].includes(s+16))){
              notTerrain.push(s);
            }
          });
        }else if(ship == 'submarine'){
          p2CurrentMap[0].forEach((s) => {
            p2vertBounds[1].push(s);
          });
          p2CurrentMap[1].forEach((s) => {
            if(!(p2CurrentMap[1].includes(s+16) && p2CurrentMap[1].includes(s+32))){
              notTerrain.push(s);
            }
          });
        }else if(ship == 'cruiser'){
          p2CurrentMap[1].forEach((s) => {
            p2vertBounds[2].push(s);
          });
          p2CurrentMap[0].forEach((s) => {
            if(!(p2CurrentMap[0].includes(s+16) && p2CurrentMap[0].includes(s+32))){
              notTerrain.push(s);
            }
          });
        }else if(ship == 'battleship'){
          p2CurrentMap[0].forEach((s) => {
            p2vertBounds[3].push(s);
          });
          p2CurrentMap[1].forEach((s) => {
            if(!(p2CurrentMap[1].includes(s+16) && p2CurrentMap[1].includes(s+32) && p2CurrentMap[1].includes(s+48))){
              notTerrain.push(s);
            }
          });
        }else if(ship == 'carrier'){
          p2CurrentMap[1].forEach((s) => {
            p2vertBounds[4].push(s);
          });
          p2CurrentMap[0].forEach((s) => {
            if(!(p2CurrentMap[0].includes(s+16) && p2CurrentMap[0].includes(s+32) && p2CurrentMap[0].includes(s+48) && p2CurrentMap[0].includes(s+64))){
              notTerrain.push(s);
            }
          });
        }
      }
    }  

    return notTerrain;
  }

  //console.log(p1CurrentMap, shared);
  let p1horiBounds = [calculateHoriBounds(1, 'p1'), calculateHoriBounds(2, 'p1'), calculateHoriBounds(2, 'p1'), calculateHoriBounds(3, 'p1'), calculateHoriBounds(4, 'p1')];
  let p1vertBounds = [calculateVertBounds(1, 'p1'), calculateVertBounds(2, 'p1'), calculateVertBounds(2, 'p1'), calculateVertBounds(3, 'p1'), calculateVertBounds(4, 'p1')];


  function p1DragDrop() {
          //console.log(calculateVertBounds(3));
          //console.log($(this).attr("data-pname"), isHorizontal);
          let shipNameWithLastId = draggedShip.lastChild.id;
          let shipClass = shipNameWithLastId.slice(0, -2);
          //console.log(shipClass);
          let boundHit = false;

          //console.log(this == document.querySelector(`[data-id='${parseInt($(this).attr("data-id"))}']`));
          //this.append(draggedShip);
          let shipPlaces = [];
      
          let temp;
          let tempPlaces = [];
          let place;
          if(isHorizontal){
            for (let i = 0; i < draggedShipLength; i++) {
                temp = parseInt($(this).attr("data-id")) + i;
                //console.log(temp);

                let notTerrain;

                if(i == 0) {

                  shipNames.forEach((ship, index) => {
                    if(shipClass == ship) {
                      notTerrain = addTerrainBounds('p1', ship, true);
                      notTerrain.forEach((n) => {
                        p1horiBounds[index].push(n);
                      });
                      p1horiBounds[index].forEach((b) => {
                        if(b === temp) {
                          boundHit = true;
                        }
                      });
                    }
                  });
                  
                }

                if(!boundHit){
                  place = document.querySelector(`[data-id='${temp}']`);
                  shipPlaces.push(place);
                  tempPlaces.push(temp);
                  numberOfShipsDropped++;
                }
              
                p1horiBounds.forEach((b) => {
                  tempPlaces.forEach((t) => {
                    b.push(t);
                  });
                });

            }
          }else if(!isHorizontal){
            for (let i = 0; i < draggedShipLength; i++) {
                temp = parseInt($(this).attr("data-id")) + (16 * i);
                //console.log(temp);

                let notTerrain;

                if(i == 0) {

                  shipNames.forEach((ship, index) => {
                    if(shipClass == ship) {
                      notTerrain = addTerrainBounds('p1', ship, false);
                      notTerrain.forEach((n) => {
                        p1vertBounds[index].push(n);
                      });
                      p1vertBounds[index].forEach((b) => {
                        if(b === temp) {
                          boundHit = true;
                        }
                      });
                    }
                  });
                  
                }

                if(!boundHit){
                  place = document.querySelector(`[data-id='${temp}']`);
                  shipPlaces.push(place);
                  tempPlaces.push(temp);
                  numberOfShipsDropped++;
                }

                p1vertBounds.forEach((b) => {
                  tempPlaces.forEach((t) => {
                    b.push(t);
                  });
                });

            }
          }
          

          if(!boundHit){
            let classes = $(draggedShip).attr('class').split(/\s+/);

            shipNames.forEach((ship, index) => {
              if(classes[1] == 'p1-'+ship+'-container') {
                shared.p1placed[index] = true;
                for (let j = 0; j < tempPlaces.length; j++) {
                    shared.p1ShipsPos[index].push(tempPlaces[j]);
                }
              }
            });

          //console.log(tempPlaces);
          //let overlap = false;
          for (let p = 0; p < shipPlaces.length; p++) {
            //console.log('overlap');
            shipPlaces[p].classList.add('taken', shipClass);
          }
            
            displayGrid1.removeChild(draggedShip);
          }
          //console.log(shared);

  }


  let p2horiBounds = [calculateHoriBounds(1, 'p2'), calculateHoriBounds(2, 'p2'), calculateHoriBounds(2, 'p2'), calculateHoriBounds(3, 'p2'), calculateHoriBounds(4, 'p2')];
  let p2vertBounds = [calculateVertBounds(1, 'p2'), calculateVertBounds(2, 'p2'), calculateVertBounds(2, 'p2'), calculateVertBounds(3, 'p2'), calculateVertBounds(4, 'p2')];

  function p2DragDrop() {
          //console.log($(this).attr("data-id"), isHorizontal);
          let shipNameWithLastId = draggedShip.lastChild.id;
          let shipClass = shipNameWithLastId.slice(0, -2);

          let boundHit = false;

          //console.log(this == document.querySelector(`[data-id='${parseInt($(this).attr("data-id"))}']`));
          //this.append(draggedShip);
          let shipPlaces = [];
      
          let temp;
          let tempPlaces = [];
          let place;
          if(isHorizontal){
            for (let i = 0; i < draggedShipLength; i++) {
                temp = parseInt($(this).attr("data-id")) + i;
                //console.log(temp);

                if(i == 0) {

                  shipNames.forEach((ship, index) => {
                    if(shipClass == ship) {
                      notTerrain = addTerrainBounds('p2', ship, true);
                      notTerrain.forEach((n) => {
                        p2horiBounds[index].push(n);
                      });
                      p2horiBounds[index].forEach((b) => {
                        if(b === temp) {
                          boundHit = true;
                        }
                      });
                    }
                  });
                  
                }

                if(!boundHit){
                  place = document.querySelector(`[data-id='${temp}']`);
                  shipPlaces.push(place);
                  tempPlaces.push(temp);
                  numberOfShipsDropped++;
                }

                p2horiBounds.forEach((b) => {
                  tempPlaces.forEach((t) => {
                    b.push(t);
                  });
                });

            }
          }else if(!isHorizontal){
            for (let i = 0; i < draggedShipLength; i++) {
                temp = parseInt($(this).attr("data-id")) + (16 * i);
                //console.log(temp);

                if(i == 0) {

                  shipNames.forEach((ship, index) => {
                    if(shipClass == ship) {
                      notTerrain = addTerrainBounds('p2', ship, false);
                      notTerrain.forEach((n) => {
                        p2vertBounds[index].push(n);
                      });
                      p2vertBounds[index].forEach((b) => {
                        if(b === temp) {
                          boundHit = true;
                        }
                      });
                    }
                  });
                  
                }

                if(!boundHit){
                  place = document.querySelector(`[data-id='${temp}']`);
                  shipPlaces.push(place);
                  tempPlaces.push(temp);
                  numberOfShipsDropped++;
                }

                p2vertBounds.forEach((b) => {
                  tempPlaces.forEach((t) => {
                    b.push(t);
                  });
                });
                
            }
          }

          if(!boundHit){
            let classes = $(draggedShip).attr('class').split(/\s+/);

            shipNames.forEach((ship, index) => {
              if(classes[1] == 'p2-'+ship+'-container') {
                shared.p2placed[index] = true;
                for (let j = 0; j < tempPlaces.length; j++) {
                    shared.p2ShipsPos[index].push(tempPlaces[j]);
                }
              }
            });

          //console.log(shipPlaces);
          for (let p = 0; p < shipPlaces.length; p++) {
            shipPlaces[p].classList.add('taken', shipClass);      
          }

            displayGrid2.removeChild(draggedShip);
          }
      
  }

  function dragEnd() {
      console.log('dragend');
  }
  
  



/////////////////////////////////////////////////////////////////////// STORE SHIP INDICES FOR P1 & P2 AFTER BEING DRAGGED




  //WHAT DOES THIS DO?
  //function to save and share the ship cell indexes to both players
  function syncShip(ship, posarray){
    let shipPlaces = [];
    let temp;
    let place;
    for (let i = 0; i < posarray.length; i++) {
      temp = posarray[i];
      //console.log(temp);
      place = document.querySelector(`[data-id='${temp}']`);
      shipPlaces.push(place);
    }           
    
    //console.log(shipPlaces);
    for (let p = 0; p < shipPlaces.length; p++) {
      shipPlaces[p].classList.add('taken', ship); 
    }
    //console.log(shared);
    
  }

  function syncEnts(posarray){
    let entPlaces = [];
    let temp;
    let place;
    for (let i = 0; i < posarray.length; i++) {
      temp = posarray[i];
      //console.log(temp);
      place = document.querySelector(`[data-id='${temp}']`);
      entPlaces.push(place);
    }           
    
    //console.log(entPlaces);
    for (let p = 0; p < entPlaces.length; p++) {
      if(entPlaces[p].classList.contains('submarine') || entPlaces[p].classList.contains('battleship')){
        entPlaces[p].classList.add('dentangled'); 
      }else{
        entPlaces[p].classList.add('entangled'); 
      }

    }
    //console.log(shared);
    
  }

  
  let p1ShipsPlaced = [false, false, false, false, false];
  let p2ShipsPlaced = [false, false, false, false, false];

  setInterval(() => {
    checkP1ShipsPlaced();
    checkP2ShipsPlaced();
    displaySquare();
    checkHitOrMiss();
    checkForWins();
  }, 500);

  function checkP1ShipsPlaced() {
    if(!(room.getHostName() === client.getUid())){
      p1Ships.forEach((ship, index) => {
        if(shared.p1placed[index]){ //check that ship has been dragged onto board
          if(!(p1ShipsPlaced[index])){ //check if p1ShipsPlaced[index] is false
            syncShip(shipNames[index], shared.p1ShipsPos[index]); //calls function to save and share the ship cell indexes to both players
            displayGrid1.removeChild(ship); 
            p1ShipsPlaced[index] = true;
          }
        }
      });
    }
  }

  function checkP2ShipsPlaced() {
    if(room.getHostName() === client.getUid()){
      p2Ships.forEach((ship, index) => {
        if(shared.p2placed[index]){ //check that ship has been dragged onto board
          if(!(p2ShipsPlaced[index])){ //check if p1ShipsPlaced[index] is false
            syncShip(shipNames[index], shared.p2ShipsPos[index]); //calls function to save and share the ship cell indexes to both players
            displayGrid2.removeChild(ship);
            p2ShipsPlaced[index] = true;
          }
        }
      });
    }
  }





  
  /////////////////////////////////////////////////////////////////////// SQUARE DISPLAYS + UPDATES





  let p1DestroyerCount = 0;
  let p1SubmarineCount = 0;
  let p1CruiserCount = 0;
  let p1BattleshipCount = 0;
  let p1CarrierCount = 0;

  let p2DestroyerCount = 0;
  let p2SubmarineCount = 0;
  let p2CruiserCount = 0;
  let p2BattleshipCount = 0;
  let p2CarrierCount = 0;

  function displaySquare(){
    if(room.getHostName() === client.getUid()){
      p2Squares.forEach((square, index) => {
        if (square.classList.contains('boom') || square.classList.contains('doom') || square.classList.contains('miss')){
          revealSquare(square, 'p2', index);
        }
        else{
          square.classList.add('hide');
        }
      })
    }
    else{
      p1Squares.forEach((square, index) => {
        if (square.classList.contains('boom') || square.classList.contains('doom') || square.classList.contains('miss')){
          square.classList.remove('hide');
          revealSquare(square, 'p1', index);
        }
        else{
          square.classList.add('hide');
        }
      })
    }
  }

  function revealSquare(square, turnState, index) { //when turnstate = p2, reveal square on p2grid
    if(square.classList.contains('boom') || square.classList.contains('doom') || square.classList.contains('miss')) return;

    if(square.classList.contains('taken') && !(square.classList.contains('entangled')) && !(square.classList.contains('dentangled'))) { 
      if(square.classList.contains('submarine') || square.classList.contains('battleship')){
        square.classList.add('doom');
      }else{
        square.classList.add('boom');
      }
      playMusic("./assets/sounds/catBoom.wav");
      shipCount(square);
      if(turnState == 'p2') {
        shared.p2SquareStates[index] = true;
      } else if(turnState == 'p1') {
        shared.p1SquareStates[index] = true;
      }
    } else {
      square.classList.add('miss');
      playMusic("./assets/sounds/miss.wav");

      if(turnState == 'p2') {
        shared.p2SquareStates[index] = true;
      } else if(turnState == 'p1') {
        shared.p1SquareStates[index] = true;
      }

    }

    if ((square.classList.contains('entangled') || square.classList.contains('dentangled')) && turnState=='p1'){ //boom entangled squares. not working yet{
      if(square.classList.contains('submarine') || square.classList.contains('battleship')){
        //square.className = '';
        square.classList.remove('doom');
        square.classList.add('entdoom');
      }else{
        //square.className = '';
        square.classList.remove('boom');
        square.classList.add('entboom');
      }
      playMusic("./assets/sounds/entMine.wav");
      //console.log("entangled found");
      shipCount(square);
      // for(let i=0; i<entangleMax; i++){
      //   if(square.classList.contains(i)){
      //     tempIndex = i;
      //     //console.log("going to boom for p1: ", tempIndex);
      //     boomEntangledPair(tempIndex,'p2');
      //     break;
      //   }
      // }
      p2Squares.forEach((sq, index) => {
        if(square.classList.contains('0')){
          if(sq.classList.contains('0')){
            shared.p2SquareStates[index] = true;
          }
        }else if(square.classList.contains('1')){
          if(sq.classList.contains('1')){
            shared.p2SquareStates[index] = true;
          }
        }
      });
    }else if ((square.classList.contains('entangled') || square.classList.contains('dentangled')) && turnState=='p2'){ //boom entangled squares. not working yet{
      if(square.classList.contains('submarine') || square.classList.contains('battleship')){
        //square.className = '';
        square.classList.remove('doom');
        square.classList.add('entdoom');
      }else{
        //square.className = '';
        square.classList.remove('boom');
        square.classList.add('entboom');
      }
      playMusic("./assets/sounds/entMine.wav");
      //console.log("entangled found");
      shipCount(square);
      // for(let i=0; i<entangleMax; i++){
      //   if(square.classList.contains(i)){
      //     tempIndex = i;
      //     //console.log("going to boom for p2: ", tempIndex);
      //     boomEntangledPair(tempIndex,'p1');
      //     break;
      //   }
      // }
      p1Squares.forEach((sq, index) => {
        if(square.classList.contains('0')){
          if(sq.classList.contains('0')){
            shared.p1SquareStates[index] = true;
          }
        }else if(square.classList.contains('1')){
          if(sq.classList.contains('1')){
            shared.p1SquareStates[index] = true;
          }
        }
      });
    }
    // checkForWins();
    // playGame();
  }
  const buttonList = document.querySelectorAll("button")
  for(let i=0;i<buttonList.length;i++){
    buttonList[i].addEventListener('click', buttonMusic );
  }
  function buttonMusic() {
    new Audio("./assets/sounds/buttonEdited.wav").play()
    return;
  }
  function playMusic(url) {
    new Audio(url).play()
    return;
  }





  /////////////////////////////////////////////////////////////////////// HIT AND MISS





  function checkHitOrMiss(){
    shared.p1SquareStates.forEach((state, index) => {
      if(state == true){
        if(p1Squares[index].classList.contains('entangled') || p1Squares[index].classList.contains('dentangled')){
          if(p1Squares[index].classList.contains('submarine') || p1Squares[index].classList.contains('battleship')){
            p1Squares[index].classList.add('entdoom');
          }else if(p1Squares[index].classList.contains('destroyer') || p1Squares[index].classList.contains('cruiser') || p1Squares[index].classList.contains('carrier')){
            p1Squares[index].classList.add('entboom');
          }
        }else{
          if(p1Squares[index].classList.contains('taken')){
            if(p1Squares[index].classList.contains('submarine') || p1Squares[index].classList.contains('battleship')){
              p1Squares[index].classList.add('doom');
            }else{
              p1Squares[index].classList.add('boom');
            }
          }else if(p1Squares[index].classList.contains('land')){
            p1Squares[index].classList.remove('land');
            p1Squares[index].classList.add('greenmiss');
          }else if(p1Squares[index].classList.contains('waste')){
            p1Squares[index].classList.remove('waste');
            p1Squares[index].classList.add('pinkmiss');
          }
          
        }
        
        state = false;
      }
    });

    shared.p2SquareStates.forEach((state, index) => {
      if(state == true){
        if(p2Squares[index].classList.contains('entangled') || p2Squares[index].classList.contains('dentangled')){
          if(p2Squares[index].classList.contains('submarine') || p2Squares[index].classList.contains('battleship')){
            p2Squares[index].classList.add('entdoom');
          }else if(p2Squares[index].classList.contains('destroyer') || p2Squares[index].classList.contains('cruiser') || p2Squares[index].classList.contains('carrier')){
            p2Squares[index].classList.add('entboom');
          }
        }else{
          if(p2Squares[index].classList.contains('taken')){
            if(p2Squares[index].classList.contains('submarine') || p2Squares[index].classList.contains('battleship')){
              p2Squares[index].classList.add('doom');
            }else{
              p2Squares[index].classList.add('boom');
            }
          }else if(p2Squares[index].classList.contains('land')){
            p2Squares[index].classList.remove('land');
            p2Squares[index].classList.add('greenmiss');
          }else if(p2Squares[index].classList.contains('waste')){
            p2Squares[index].classList.remove('waste');
            p2Squares[index].classList.add('pinkmiss');
          }

        }
        
        state = false;
      }
    });
  }




  /////////////////////////////////////////////////////////////////////// ENTANGLE MECHANIC





  let entangleCount=0;
  let entangleMax=2;
  let paired=false;
  let i=0;
  for(let i=0;i<entangleMax*2;i++){
    shared.entangledPoints[0].push(false)
  }
  for(let i=0;i<entangleMax*2;i++){
    shared.entangledPoints[1].push(false)
  }
  function checkEntanglePossible(){
    let entanglePossible= true;
    shared.p2placed.forEach((state) => {
      if(state===false){
        entanglePossible=false;
        infoDisplay.innerHTML ="Player 2 has not placed all ships yet";
      }
    })
    shared.p1placed.forEach((state) => {
      if(state===false){
        entanglePossible=false;
        infoDisplay.innerHTML ="Player 1 has not placed all ships yet";
      }
    })
    if(entanglePossible==true){
      infoDisplay.innerHTML ="Double Click to Entangle";
      entangleBegin();
    }
  }
  function entangleBegin(){
    rotateButton.style.display="none"; //remove button from view
    entangleButton.style.display="none"; //remove button from view
    startButton.style.opacity="100%"; ; //show button in view
    startButton.style.position="relative"; ; //show button in view
    setInterval(()=> {
      chooseEntanglePoints();
    }, 500);
  }

  function chooseEntanglePoints(){
    p1Squares.forEach(square => square.addEventListener('dblclick', function(e){
      //console.log(shared.entangledPoints);
      if (square.classList.contains('taken') && !square.classList.contains('entangled') && !square.classList.contains('dentangled') && entangleCount<entangleMax) {
        shared.entangledPos[0].push($(square).attr("data-id"));
        playMusic("./assets/sounds/entPlaced.wav");
        if(square.classList.contains('submarine') || square.classList.contains('battleship')){
          square.classList.add('dentangled');
        }else{
          square.classList.add('entangled');
        }
        square.classList.add(entangleCount);
        shared.entangledCount++; //keeping track of how many points are entangled
        assignEntanglePair1(entangleCount);
        entangleCount++;
        infoDisplay.innerHTML ="";
      }else if(entangleCount>=entangleMax){
        infoDisplay.innerHTML ="You can't entangle any more, don't be greedy";
      }else if(!square.classList.contains('taken')){
        infoDisplay.innerHTML ="You're trying to entangle the sea";
      }
    }));

    p2Squares.forEach(square => square.addEventListener('dblclick', function(e){
      //console.log(shared.entangledPoints);
      if (square.classList.contains('taken') && !square.classList.contains('entangled') && !square.classList.contains('dentangled') && entangleCount<entangleMax) {
        shared.entangledPos[1].push($(square).attr("data-id"));
        playMusic("./assets/sounds/entPlaced.wav");
        if(square.classList.contains('submarine') || square.classList.contains('battleship')){
          square.classList.add('dentangled');
        }else{
          square.classList.add('entangled');
        }
        square.classList.add(entangleCount);
        shared.entangledCount++; //keeping track of how many points are entangled
        assignEntanglePair2(entangleCount);
        entangleCount++;
        infoDisplay.innerHTML ="";
      }else if(entangleCount>=entangleMax){
        infoDisplay.innerHTML ="You can't entangle any more, don't be greedy";
      }else if(!square.classList.contains('taken')){
        infoDisplay.innerHTML ="You're trying to entangle the sea";
      }
    }));
    
  }

  function assignEntanglePair1(index){
    paired=false;
    randomPoint= Math.floor(Math.random() * (width*width));
    while(paired===false){
    if (p2Squares[randomPoint].classList.contains('taken') && !p2Squares[randomPoint].classList.contains('entangled') && !p2Squares[randomPoint].classList.contains('dentangled')){
      if(p2Squares[randomPoint].classList.contains('submarine') || p2Squares[randomPoint].classList.contains('battleship')){
        p2Squares[randomPoint].classList.add('dentangled');
      }else{
        p2Squares[randomPoint].classList.add('entangled');
      }
      shared.entangledPos[1].push($(p2Squares[randomPoint]).attr("data-id"));
      p2Squares[randomPoint].classList.add(index);
      //console.log("assigned random for entCount", index);
      paired=true;
      break;
      }
      else
        randomPoint= Math.floor(Math.random() * (width*width));
    }
  }

  function assignEntanglePair2(index){
    paired=false;
    randomPoint= Math.floor(Math.random() * (width*width));
    while(paired===false){
      if (p1Squares[randomPoint].classList.contains('taken') && !p1Squares[randomPoint].classList.contains('entangled')){
        if(p1Squares[randomPoint].classList.contains('submarine') || p1Squares[randomPoint].classList.contains('battleship')){
          p1Squares[randomPoint].classList.add('dentangled');
        }else{
          p1Squares[randomPoint].classList.add('entangled');
        }
        shared.entangledPos[0].push($(p1Squares[randomPoint]).attr("data-id"));
        p1Squares[randomPoint].classList.add(index);
        //console.log("assigned random for entCount", index);
        paired=true;
        break;
      }
      else
        randomPoint= Math.floor(Math.random() * (width*width));
    }
  }

  function boomEntangledPair(i , p){
    //console.log("booming thing with class", i, "for player ", p);
    if(p=='p2'){
      p2Squares.forEach((p2sqr, index) => {
        if(p2sqr.classList.contains(i)){
          // if(p2sqr.classList.contains('submarine') || p2sqr.classList.contains('battleship')){
          //   p2sqr.classList.add('entdoom');
          // }else if(p2sqr.classList.contains('destroyer') || p2sqr.classList.contains('cruiser') || p2sqr.classList.contains('carrier')){
          //   p2sqr.classList.add('entboom');
          // }
          shared.p2SquareStates[index] = true;
          playMusic("./assets/sounds/entCat.wav");
          shipCount(p2sqr);
        }
      })
    }else{
      p1Squares.forEach((p1sqr, index) => {
        if(p1sqr.classList.contains(i)){
          // if(p1sqr.classList.contains('submarine') || p1sqr.classList.contains('battleship')){
          //   p1sqr.classList.add('entdoom');
          // }else if(p1sqr.classList.contains('destroyer') || p1sqr.classList.contains('cruiser') || p1sqr.classList.contains('carrier')){
          //   p1sqr.classList.add('entboom');
          // }
          shared.p1SquareStates[index] = true;
          playMusic("./assets/sounds/entCat.wav");
          shipCount(p1sqr);
        }
      })
    }
  }
  entangleButton.addEventListener('click', checkEntanglePossible);



/////////////////////////////////////////////////////////////////////// START GAME + MECHANICS






  let turnState = 'p1';
  function begin(){
    shared.startCount++;
    startButton.style.display="none"; //remove button from view
    if(shared.entangledCount>=(entangleMax*2)){
        startCheck();
    }
    else
      infoDisplay.innerHTML = 'Waiting for both players to entangle ' + entangleMax + ' squares each'; 
  }
  //check if everyone is ready to start playing
  function startCheck(){
    //console.log("startCheck now")
    if(shared.startCount>=2){
      gameSetup();
    }else if (shared.startCount==1){
      infoDisplay.innerHTML = 'Waiting for a player to start game';
      setInterval(()=> {
        startCheck();
      }, 500);
    }
      
  }
  function gameSetup(){
    //console.log(shared.entangledPoints, shared.entangledPos); 
      if(room.getHostName() === client.getUid()){
        syncEnts(shared.entangledPos[0]);
        syncEnts(shared.entangledPos[1]);
      }else if(!(room.getHostName() === client.getUid())){
        syncEnts(shared.entangledPos[0]);
        syncEnts(shared.entangledPos[1]);
      }


      entangleButton.removeEventListener('click', entangleBegin);
      rotateButton.style.display="none"; //remove button from view
      entangleButton.style.display="none"; //remove button from view
      startButton.style.display="none"; //remove button from view
      //console.log("game starts");

      displayGrid2.style.opacity = 0; //can't see see ship container
      displayGrid1.style.opacity = 0; //can't see ship container


      gameInfo.style.top = "85%"; gameInfo.style.left=0; gameInfo.style.border='0px';
    
      setInterval(()=> {
        playGame();
        checkForWins();
        turnGridDisplay();
      }, 500);
  }
  //Game Logic
  function playGame() {
    //console.log(currentPlayer);
    if (isGameOver) return;
    if(numberOfShipsDropped>=totalShipCount)
      gameClicks()
    else if (numberOfShipsDropped<totalShipCount)
      infoDisplay.innerHTML = 'All Ships Not Placed'
  }
  startButton.addEventListener('click', begin);





/////////////////////////////////////////////////////////////////////// ENFORCE TURNS






function turnGridDisplay(){
  if(shared.currentPlayer === 'p1'){
    overlay1.style.backgroundColor="#060841";
    p1Grid.style.opacity='40%';
    p2Grid.style.opacity='100%';
  }
  else if(shared.currentPlayer === 'p2'){
    overlay2.style.backgroundColor="#060841";
    p1Grid.style.opacity='100%';
    p2Grid.style.opacity='40%';
  }
  else{
    console.log(error);
  }
}
function gameClicks(){
  infoDisplay.innerHTML = ''
      p2Squares.forEach((square, index) => square.addEventListener('click', function(e) {
        if (shared.currentPlayer === 'p1' && room.getHostName() === client.getUid()) {
          revealSqChecked(square,index,'p2',2);
        }
      }))

      p1Squares.forEach((square, index) => square.addEventListener('click', function(e) {
        if (shared.currentPlayer === 'p2' && room.getHostName() != client.getUid()) {
          revealSqChecked(square,index,'p1',1);
        }
      }))
}
function revealSqChecked(sq,i,player,playNum){
  // turnDisplay.innerHTML = 'Player '+ shared.currentPlayer + ' Go';
  revealSquare(sq, player, i);
  shared.currentPlayer = player;
}





/////////////////////////////////////////////////////////////////////// END GAME CHECKS + WIN SCREEN


  const winScreenDisp = document.querySelector('#winner');
  const loseScreenDisp = document.querySelector('#loser');
  winScreenDisp.style.display="none";
  loseScreenDisp.style.display="none";
  let pCheck=50;
  function shipCount(square){
    if (turnState=='p1') { //counts number of p1 ships that have been destroyed
      if (square.classList.contains('destroyer')) p1DestroyerCount++;
      if (square.classList.contains('submarine')) p1SubmarineCount++;
      if (square.classList.contains('cruiser')) p1CruiserCount++;
      if (square.classList.contains('battleship')) p1BattleshipCount++;
      if (square.classList.contains('carrier')) p1CarrierCount++;
    }
    else if (turnState=='p2') { //counts number of p2 ships that have been destroyed
      if (square.classList.contains('destroyer')) p2DestroyerCount++;
      if (square.classList.contains('submarine')) p2SubmarineCount++;
      if (square.classList.contains('cruiser')) p2CruiserCount++;
      if (square.classList.contains('battleship')) p2BattleshipCount++;
      if (square.classList.contains('carrier')) p2CarrierCount++;
    }
  }
  function checkForWins() {
    if (p1DestroyerCount === 2) {
      infoDisplay.innerHTML = 'You sunk player 1 \'s destroyer'
      p1DestroyerCount = 10
    }
    if (p1SubmarineCount === 3) {
      infoDisplay.innerHTML = 'You sunk player 1 \'s submarine'
      p1SubmarineCount = 10
    }
    if (p1CruiserCount === 3) {
      infoDisplay.innerHTML = 'You sunk player 1 \'s cruiser'
      p1CruiserCount = 10
    }
    if (p1BattleshipCount === 4) {
      infoDisplay.innerHTML = 'You sunk player 1 \'s battleship'
      p1BattleshipCount = 10
    }
    if (p1CarrierCount === 5) {
      infoDisplay.innerHTML = 'You sunk player 1 \'s carrier'
      p1CarrierCount = 10
    }
    if (p2DestroyerCount === 2) {
      infoDisplay.innerHTML = 'You sunk player 2 \'s Destroyer'
      p2DestroyerCount = 10
    }
    if (p2SubmarineCount === 3) {
      infoDisplay.innerHTML = 'You sunk player 2 \'s Submarine'
      p2SubmarineCount = 10
    }
    if (p2CruiserCount === 3) {
      infoDisplay.innerHTML = 'You sunk player 2 \'s Cruiser'
      cpuCruiserCount = 10
    }
    if (p2BattleshipCount === 4) {
      infoDisplay.innerHTML = 'You sunk player 2 \'s Battleship'
      p2BattleshipCount = 10
    }
    if (p2CarrierCount === 5) {
      infoDisplay.innerHTML = 'You sunk player 2 \'s Carrier'
      p2CarrierCount = 10
    }
    if ((p1DestroyerCount + p1SubmarineCount + p1CruiserCount + p1BattleshipCount + p1CarrierCount) === 50) {
      infoDisplay.innerHTML = "PLAYER 1 WINS";
      console.log( "PLAYER 1 WINS");
      if(room.getHostName() === client.getUid()){
        winScreenDisp.style.display="block";
      }
      else
        loseScreenDisp.style.display="block";
      gameOver()
    }
    if ((p2DestroyerCount + p2SubmarineCount + p2CruiserCount + p2BattleshipCount + p2CarrierCount) === 50) {
      infoDisplay.innerHTML = "PLAYER 2 WINS";
      console.log( "PLAYER 2 WINS");
      if(room.getHostName() != client.getUid()){
        winScreenDisp.style.display="block";
      }
      else
      loseScreenDisp.style.display="block";
      gameOver()
    }
  }
  function gameOver() {
  isGameOver = true;
  startButton.removeEventListener('click', begin);
  }





  
  /////////////////////////////////////////////////////////////////////// INSTRUCTIONS






  const pageKey = document.querySelector('.key'); //key
  const pageKeyContent = document.querySelector('.keyContent'); //key content
  const pageInstruct = document.querySelector('.instruct'); //instruction
  const pageInstructContent = document.querySelector('.instructContent'); //instruction content
  const prev = document.querySelector('#prev'); //instruction
  const next = document.querySelector('#next'); //instruction content

  let toggleKey = false;
  let toggleInstruct = false;

  pageKeyContent.style.opacity=0;
  pageInstructContent.style.opacity=0;
  pageKeyContent.style.display="none";
  pageInstructContent.style.display="none";

  var img = new Array("./assets/instructions/step1.jpg","./assets/instructions/step2.jpg","./assets/instructions/step3.jpg","./assets/instructions/step3.2.jpg","./assets/instructions/step4.jpg","./assets/instructions/step5.jpg","./assets/instructions/step6.jpg","./assets/instructions/step7.jpg");

  var imgElement = document.getElementById("imgDemo");
  let imgi = 0;
  let imgLen = img.length;
  
  function checkKey(){
    //console.log(toggleKey)
    if(toggleKey==false){
      pageKeyContent.style.opacity="100%";
      pageKeyContent.style.display="block";
    }
    else{
      pageKeyContent.style.opacity=0;
      pageKeyContent.style.display="none";
    }
    toggleKey=!toggleKey;
  }

  function checkInstruct(){
    //console.log("clicked Instruct")
    if(toggleInstruct==false){
      pageInstructContent.style.opacity="100%";
      pageInstructContent.style.display="block";
      
    }
    else{
      pageInstructContent.style.opacity="0%";
      pageInstructContent.style.display="none";
    }
    toggleInstruct=!toggleInstruct;

  }

function nextImg()
{
    if(imgi < imgLen-1)
        {
            imgi++;
        }
    else{
            imgi=0;                
        }

        imgElement.src = img[imgi];                    
}

function prevImg()
{
    if(imgi > 0)
        {
            imgi--;
        }
    else
    {
        imgi = imgLen-1;
    }
        imgElement.src = img[imgi];                    
}

  pageKey.addEventListener('click', checkKey);
  pageInstruct.addEventListener('click', checkInstruct);
  prev.addEventListener('click', prevImg);
  next.addEventListener('click', nextImg);


  // pageInstruct.addEventListener('click', checkInstruct);
  

  /////////////////////////////////////////////////////////////////////// FIN
}