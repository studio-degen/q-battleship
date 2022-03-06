function setup(client, room, shared, my, participants) {
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
    gameInfo.style.left="50%"; 
    gameInfo.style.top="100px";
    p2Grid.style.opacity = 0; //can't see opponents grid
    console.log('you host')
  }else{ //checks whether you are player 2
    displayGrid1.style.opacity = 0; //can't see/move opponents ships
    displayGrid1.style.display = "none"; 
    gameInfo.style.top="100px";
    gameInfo.style.left=0; 
    p1Grid.style.opacity = 0; //can't see opponents grid
    console.log('you not host');
  }

  //Q1: IS THIS JUST A CHECK?
  let participNum = 0;
  setInterval(() => {
    participNum = 0;
    participants.forEach(()=>{
      participNum++;
      //console.log("participant number: ", participNum);
    });
  }, 1000);

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


  let isHorizontal = true;
  let isGameOver = false;

  //All shared variables
  shared.p1placed = [false, false, false, false, false];
  shared.p2placed = [false, false, false, false, false];
  shared.p1ShipsPos = [[],[],[],[],[]];
  shared.p2ShipsPos = [[],[],[],[],[]];
  shared.entangledPoints = [[]];
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

  //Create Board fn
  function createBoard(grid, squares, pname, states) {
    for (let i = 0; i < width*width; i++) {
      const square = document.createElement('div');
      if(pname == 'p1'){
        square.dataset.id = i;
      }else if(pname == 'p2'){
        square.dataset.id = width*width + i;
      }  
      grid.appendChild(square);
      squares.push(square);
      states.push('false');
    }
  }
  createBoard(p1Grid, p1Squares, 'p1', shared.p1SquareStates); //board for p1
  createBoard(p2Grid, p2Squares, 'p2', shared.p2SquareStates); //board for p2

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

  let p1horiBounds = [calculateHoriBounds(1, 'p1'), calculateHoriBounds(2, 'p1'), calculateHoriBounds(3, 'p1'), calculateHoriBounds(4, 'p1')];
  let p1vertBounds = [calculateVertBounds(1, 'p1'), calculateVertBounds(2, 'p1'), calculateVertBounds(3, 'p1'), calculateVertBounds(4, 'p1')];

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

                if(i == 0) {
                  if(shipClass == 'destroyer') {
                    p1horiBounds[0].forEach((b) => {
                      if(b === temp) {
                        boundHit = true;
                      }
                    });
                  }else if(shipClass == 'submarine' || shipClass == 'cruiser') {
                    p1horiBounds[1].forEach((b) => {
                      if(b === temp) {
                        boundHit = true;
                      }
                    });
                  }else if(shipClass == 'battleship') {
                    p1horiBounds[2].forEach((b) => {
                      if(b === temp) {
                        boundHit = true;
                      }
                    });
                  }else if(shipClass == 'carrier') {
                    p1horiBounds[3].forEach((b) => {
                      if(b === temp) {
                        boundHit = true;
                      }
                    });
                  }
                  
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

                if(i == 0) {
                  if(shipClass == 'destroyer') {
                    p1vertBounds[0].forEach((b) => {
                      if(b === temp) {
                        boundHit = true;
                      }
                    });
                  }else if(shipClass == 'submarine' || shipClass == 'cruiser') {
                    p1vertBounds[1].forEach((b) => {
                      if(b === temp) {
                        boundHit = true;
                      }
                    });
                  }else if(shipClass == 'battleship') {
                    p1vertBounds[2].forEach((b) => {
                      if(b === temp) {
                        boundHit = true;
                      }
                    });
                  }else if(shipClass == 'carrier') {
                    p1vertBounds[3].forEach((b) => {
                      if(b === temp) {
                        boundHit = true;
                      }
                    });
                  }
                  
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
          
          //console.log(tempPlaces);
          //let overlap = false;
          for (let p = 0; p < shipPlaces.length; p++) {
            //console.log('overlap');
            shipPlaces[p].classList.add('taken', shipClass);
          }

          if(!boundHit){
            let classes = $(draggedShip).attr('class').split(/\s+/);
            if(classes[1] == 'p1-destroyer-container') {
              shared.p1placed[0] = true;
              for (let j = 0; j < tempPlaces.length; j++) {
                  shared.p1ShipsPos[0].push(tempPlaces[j]);
              }
            //console.log(shared, participants);
            } else if(classes[1] == 'p1-submarine-container') {
              shared.p1placed[1] = true;
              for (let j = 0; j < tempPlaces.length; j++) {
                  shared.p1ShipsPos[1].push(tempPlaces[j]);
              }
            } else if(classes[1] == 'p1-cruiser-container') {
              shared.p1placed[2] = true;
              for (let j = 0; j < tempPlaces.length; j++) {
                  shared.p1ShipsPos[2].push(tempPlaces[j]);
              }
            } else if(classes[1] == 'p1-battleship-container') {
              shared.p1placed[3] = true;
              for (let j = 0; j < tempPlaces.length; j++) {
                  shared.p1ShipsPos[3].push(tempPlaces[j]);
              }
            } else if(classes[1] == 'p1-carrier-container') {
              shared.p1placed[4] = true;
              for (let j = 0; j < tempPlaces.length; j++) {
                  shared.p1ShipsPos[4].push(tempPlaces[j]);
              }
            }
            
            displayGrid1.removeChild(draggedShip);
          }
          //console.log(p1horiBounds);

  }


  let p2horiBounds = [calculateHoriBounds(1, 'p2'), calculateHoriBounds(2, 'p2'), calculateHoriBounds(3, 'p2'), calculateHoriBounds(4, 'p2')];
  let p2vertBounds = [calculateVertBounds(1, 'p2'), calculateVertBounds(2, 'p2'), calculateVertBounds(3, 'p2'), calculateVertBounds(4, 'p2')];

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
                  if(shipClass == 'destroyer') {
                    p2horiBounds[0].forEach((b) => {
                      if(b === temp) {
                        boundHit = true;
                      }
                    });
                  }else if(shipClass == 'submarine' || shipClass == 'cruiser') {
                    p2horiBounds[1].forEach((b) => {
                      if(b === temp) {
                        boundHit = true;
                      }
                    });
                  }else if(shipClass == 'battleship') {
                    p2horiBounds[2].forEach((b) => {
                      if(b === temp) {
                        boundHit = true;
                      }
                    });
                  }else if(shipClass == 'carrier') {
                    p2horiBounds[3].forEach((b) => {
                      if(b === temp) {
                        boundHit = true;
                      }
                    });
                  }
                  
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
                  if(shipClass == 'destroyer') {
                    p2vertBounds[0].forEach((b) => {
                      if(b === temp) {
                        boundHit = true;
                      }
                    });
                  }else if(shipClass == 'submarine' || shipClass == 'cruiser') {
                    p2vertBounds[1].forEach((b) => {
                      if(b === temp) {
                        boundHit = true;
                      }
                    });
                  }else if(shipClass == 'battleship') {
                    p2vertBounds[2].forEach((b) => {
                      if(b === temp) {
                        boundHit = true;
                      }
                    });
                  }else if(shipClass == 'carrier') {
                    p2vertBounds[3].forEach((b) => {
                      if(b === temp) {
                        boundHit = true;
                      }
                    });
                  }
                  
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
          
          //console.log(shipPlaces);
          for (let p = 0; p < shipPlaces.length; p++) {
            shipPlaces[p].classList.add('taken', shipClass);      
          }

          if(!boundHit){
            let classes = $(draggedShip).attr('class').split(/\s+/);
            if(classes[1] == 'p2-destroyer-container') {
              shared.p2placed[0] = true;
              for (let j = 0; j < tempPlaces.length; j++) {
                  shared.p2ShipsPos[0].push(tempPlaces[j]);
              }
            } else if(classes[1] == 'p2-submarine-container') {
              shared.p2placed[1] = true;
              for (let j = 0; j < tempPlaces.length; j++) {
                  shared.p2ShipsPos[1].push(tempPlaces[j]);
              }
            } else if(classes[1] == 'p2-cruiser-container') {
              shared.p2placed[2] = true;
              for (let j = 0; j < tempPlaces.length; j++) {
                  shared.p2ShipsPos[2].push(tempPlaces[j]);
              }
            } else if(classes[1] == 'p2-battleship-container') {
              shared.p2placed[3] = true;
              for (let j = 0; j < tempPlaces.length; j++) {
                  shared.p2ShipsPos[3].push(tempPlaces[j]);
              }
            } else if(classes[1] == 'p2-carrier-container') {
              shared.p2placed[4] = true;
              for (let j = 0; j < tempPlaces.length; j++) {
                  shared.p2ShipsPos[4].push(tempPlaces[j]);
              } 
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
  function replaceShip(ship, posarray){
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

  
  let p1ShipsPlaced = [false, false, false, false, false];
  let p2ShipsPlaced = [false, false, false, false, false];

  setInterval(() => {
    //displaySquare();
    checkP1ShipsPlaced();
    checkP2ShipsPlaced();
    checkHitOrMiss();
  }, 100);

  function checkP1ShipsPlaced() {
    if(!(room.getHostName() === client.getUid())){
      p1Ships.forEach((ship, index) => {
        if(shared.p1placed[index]){ //check that ship has been dragged onto board
          if(!(p1ShipsPlaced[index])){ //check if p1ShipsPlaced[index] is false
            replaceShip(shipNames[index], shared.p1ShipsPos[index]); //calls function to save and share the ship cell indexes to both players
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
            replaceShip(shipNames[index], shared.p2ShipsPos[index]); //calls function to save and share the ship cell indexes to both players
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
        if (square.classList.contains('boom') || square.classList.contains('miss')){
          revealSquare(square, 'p2', index);
        }
        else{
          square.classList.add('hide');
        }
      })
    }
    else{
      p1Squares.forEach((square, index) => {
        if (square.classList.contains('boom') || square.classList.contains('miss')){
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
    if(square.classList.contains('boom') || square.classList.contains('miss')) return;
    if (square.classList.contains('entangled') && turnState=='p1'){ //boom entangled squares. not working yet{
      square.classList.add('boom');
      playMusic("./assets/sounds/boom.wav");
      //console.log("entangled found");
      shipCount(square);
      for(let i=0; i<entangleMax; i++){
        if(square.classList.contains(i)){
          tempIndex = i;
          //console.log("going to boom for p1: ", tempIndex);
          boomEntangledPair(tempIndex,'p2');
          break;
        }
      }
    }
    if (square.classList.contains('entangled') && turnState=='p2'){ //boom entangled squares. not working yet{
      square.classList.add('boom');
      playMusic("./assets/sounds/boom.wav");
      console.log("entangled found");
      shipCount(square);
      for(let i=0; i<entangleMax; i++){
        if(square.classList.contains(i)){
          tempIndex = i;
          //console.log("going to boom for p2: ", tempIndex);
          boomEntangledPair(tempIndex,'p1');
          break;
        }
      }
    }
    else if(square.classList.contains('taken')) { 
      square.classList.add('boom');
      playMusic("./assets/sounds/boom.wav");
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
    // checkForWins();
    // playGame();
  }
  function playMusic(url) {
    //new Audio(url).play()
    return;
  }





  /////////////////////////////////////////////////////////////////////// HIT AND MISS





  function checkHitOrMiss(){
    shared.p1SquareStates.forEach((state, index) => {
      if(state == true){
        if(p1Squares[index].classList.contains('taken')){
          p1Squares[index].classList.add('boom');
        }else{
          p1Squares[index].classList.add('miss');
        }
        state = false;
      }
    });

    shared.p2SquareStates.forEach((state, index) => {
      if(state == true){
        if(p2Squares[index].classList.contains('taken')){
          p2Squares[index].classList.add('boom');
        }else{
          p2Squares[index].classList.add('miss');
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
  for(let i=0;i<entangleMax;i++){
    shared.entangledPoints.push(false)
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
      if (square.classList.contains('taken') && !square.classList.contains('entangled') && entangleCount<entangleMax) {
        playMusic("./assets/sounds/entPlaced.wav");
        square.classList.add('entangled');
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
      if (square.classList.contains('taken') && !square.classList.contains('entangled') && entangleCount<entangleMax) {
        playMusic("./assets/sounds/entPlaced.wav");
        square.classList.add('entangled');
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
    if (p2Squares[randomPoint].classList.contains('taken') && !p2Squares[randomPoint].classList.contains('entangled')){
      p2Squares[randomPoint].classList.add('entangled');
      p2Squares[randomPoint].classList.add(index);
      console.log("assigned random for entCount", index);
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
        p1Squares[randomPoint].classList.add('entangled');
        p1Squares[randomPoint].classList.add(index);
        //console.log("assigned random for entCount", index);
        paired=true;
        break;
      }
      else
        randomPoint= Math.floor(Math.random() * (width*width));
    }
  }
  function boomEntangledPair(i,p){
    //console.log("booming thing with class", i, "for player ", p);
    if(p=='p2'){
      p2Squares.forEach(p2sqr => {
        if(p2sqr.classList.contains(i)){
          p2sqr.classList.add('boom');
          playMusic("./assets/sounds/boom.wav");
          shipCount(p2sqr);
        }
      })
    }
    else{
      p1Squares.forEach(p1sqr => {
        if(p1sqr.classList.contains(i)){
          p1sqr.classList.add('boom');
          playMusic("./assets/sounds/boom.wav");
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
    if(shared.entangledCount>=(entangleMax*2)){
      entangleButton.removeEventListener('click', entangleBegin);
      rotateButton.style.display="none"; //remove button from view
      entangleButton.style.display="none"; //remove button from view
      //console.log("game starts");

      displayGrid2.style.opacity = 0; //can't see see ship container
      displayGrid1.style.opacity = 0; //can't see ship container

      gameInfo.style.top = "85%"; gameInfo.style.left=0;
      startCheck();
      
    }
    else
      infoDisplay.innerHTML = 'Waiting for all players to entangle ' + entangleMax + ' squares'; 
  }
  //check if everyone is ready to start playing
  function startCheck(){
    if(shared.startCount>=2){
      startButton.style.display="none"; //remove button from view
      setInterval(()=> {
        playGame();
        checkForWins();
        turnGridDisplay();
      }, 100);
    }
    else if (shared.startCount==1)
      infoDisplay.innerHTML = 'Waiting for a player to start game'; 
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
      gameOver()
    }
    if ((p2DestroyerCount + p2SubmarineCount + p2CruiserCount + p2BattleshipCount + p2CarrierCount) === 50) {
      infoDisplay.innerHTML = "PLAYER 2 WINS";
      console.log( "PLAYER 2 WINS");
      gameOver()
    }
  }
  function gameOver() {
  isGameOver = true;
  startButton.removeEventListener('click', begin);
  }






  /////////////////////////////////////////////////////////////////////// FIN
}