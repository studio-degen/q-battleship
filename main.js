function setup(client, room, shared, my, participants) {
  const p1Grid = document.querySelector('.grid-p1');
  const p2Grid = document.querySelector('.grid-p2');

  const displayGrid1 = document.querySelector('.p1-grid-display');
  const displayGrid2 = document.querySelector('.p2-grid-display');

  const ships = document.querySelectorAll('.ship');

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


  if(room.getHostName() === client.getUid()){
    destroyer2.style.opacity = 0;
    submarine2.style.opacity = 0;
    cruiser2.style.opacity = 0;
    battleship2.style.opacity = 0;
    carrier2.style.opacity = 0;
    console.log('you host')
  }else{
    destroyer1.style.opacity = 0;
    submarine1.style.opacity = 0;
    cruiser1.style.opacity = 0;
    battleship1.style.opacity = 0;
    carrier1.style.opacity = 0;
    console.log('you not host');
  }
  let participNum = 0;

  setInterval(() => {
    participNum = 0;

    participants.forEach(()=>{
      participNum++;
      //console.log(participNum);
    });
  }, 1000);

  

  const startButton = document.querySelector('#start');
  const entangleButton = document.querySelector('#entangle');
  const rotateButton = document.querySelector('#rotate');

  //const whichPlayerDisplay = document.querySelector('#who-you');
  const turnDisplay = document.querySelector('#whose-go');
  const infoDisplay = document.querySelector('#info');
  //const chooseTeam = document.querySelector('#chooseteam');


  let p1Squares = [];
  let p2Squares = [];


  let isHorizontal = true;
  let isGameOver = false;

  let currentPlayer = 'p1';
  shared.p1placed = [false, false, false, false, false];
  shared.p2placed = [false, false, false, false, false];
  shared.p1ShipsPos = [[],[],[],[],[]];
  shared.p2ShipsPos = [[],[],[],[],[]];
  shared.entangledPoints = [];

  shared.p1SquareStates = [];
  shared.p2SquareStates = [];
  // setInterval(() => {
  //   console.log(shared);
  // }, 1000);


  // chooseTeam.addEventListener('change',() => {
  //   //console.log(chooseTeam.value);
  //   my.selectedTeam = chooseTeam.value;
  //   console.log(shared, my);
  // });

  if(room.getHostName() === client.getUid()) {
    shared.currentTurn = "Player1";
  }
  shared.currentTurn = shared.currentTurn || "Player1";

  let totalShipCount = 2;
  const width = 16;

  //Create Board
  function createBoard(grid, squares, pname, states) {
    for (let i = 0; i < width*width; i++) {
      const square = document.createElement('div');
      if(pname == 'p1'){
        square.dataset.id = i;
      }else if(pname == 'p2'){
        square.dataset.id = 255+i;
      }
      
      grid.appendChild(square);
      squares.push(square);
      states.push('false');
    }
  }
  createBoard(p1Grid, p1Squares, 'p1', shared.p1SquareStates);
  createBoard(p2Grid, p2Squares, 'p2', shared.p2SquareStates);
  console.log(shared);

  // function turnChange() {
  //   if(shared.currentTurn == "p1") {
  //     shared.currentTurn = "p2";
  //   } else if(shared.currentTurn == "p2") {
  //     shared.currentTurn = "p1";
  //   }
  //   console.log(shared.currentTurn);
  // }

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
      console.log(isHorizontal);
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
      console.log(isHorizontal);
      return;
    }
  }
  rotateButton.addEventListener('click', rotate);






///////////////////////////////////////////////////////////////////////





  let selectedShipNameWithIndex;
  let draggedShip;
  let draggedShipLength;
  let numberOfShipsDropped = 0;
  //move around user ship
  // let parsedP1Sq = JSON.parse(JSON.stringify(shared.p1Squares));
  // let parsedP2Sq = JSON.parse(JSON.stringify(shared.p2Squares));
  // console.log(parsedP1Sq, parsedP2Sq);

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
      //console.log(selectedShipNameWithIndex);
  }))

  function dragStart() {
      //console.log('drag start');
      draggedShip = this;
      draggedShipLength = this.childNodes.length;
      //console.log(draggedShip);
      console.log(shared);
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

  function p1DragDrop() {
          //console.log($(this).attr("data-pname"), isHorizontal);
          let shipNameWithLastId = draggedShip.lastChild.id;
          let shipClass = shipNameWithLastId.slice(0, -2);
          //console.log(shipClass);

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
              place = document.querySelector(`[data-id='${temp}']`);
              shipPlaces.push(place);
              tempPlaces.push(temp);
              numberOfShipsDropped++;
          }
          }else if(!isHorizontal){
          for (let i = 0; i < draggedShipLength; i++) {
              temp = parseInt($(this).attr("data-id")) + (16 * i);
              //console.log(temp);
              place = document.querySelector(`[data-id='${temp}']`);
              shipPlaces.push(place);
              tempPlaces.push(temp);
              numberOfShipsDropped++;
          }
          }
          
          //console.log(shipPlaces);
          for (let p = 0; p < shipPlaces.length; p++) {
          shipPlaces[p].classList.add('taken', shipClass); 
          }

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
          //console.log(shared);
          displayGrid1.removeChild(draggedShip);
  }

  function p2DragDrop() {
          //console.log($(this).attr("data-id"), isHorizontal);
          let shipNameWithLastId = draggedShip.lastChild.id;
          let shipClass = shipNameWithLastId.slice(0, -2);
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
              place = document.querySelector(`[data-id='${temp}']`);
              shipPlaces.push(place);
              tempPlaces.push(temp);
              numberOfShipsDropped++;
          }
          }else if(!isHorizontal){
          for (let i = 0; i < draggedShipLength; i++) {
              temp = parseInt($(this).attr("data-id")) + (16 * i);
              //console.log(temp);
              place = document.querySelector(`[data-id='${temp}']`);
              shipPlaces.push(place);
              tempPlaces.push(temp);
              numberOfShipsDropped++;
          }
          }
          
          //console.log(shipPlaces);
          for (let p = 0; p < shipPlaces.length; p++) {
          shipPlaces[p].classList.add('taken', shipClass);      
          }

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

  function dragEnd() {
      console.log('dragend');
  }
  
  



///////////////////////////////////////////////////////////////////////






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

  let shipNames = ['destroyer', 'submarine', 'cruiser', 'battleship', 'carrier'];

  let p1ShipsPlaced = [false, false, false, false, false];
  let p2ShipsPlaced = [false, false, false, false, false];

  setInterval(() => {
    checkP1ShipsPlaced();
    checkP2ShipsPlaced();
    checkHitOrMiss();
  }, 1000);

  function checkHitOrMiss(){
    if(!(room.getHostName() === client.getUid())){
      //console.log(shared);
      shared.p1SquareStates.forEach((state, index) => {
        if(state == true){
          //console.log(p1Squares[index].classList);
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
          //console.log(p2Squares[index].classList);
          if(p2Squares[index].classList.contains('taken')){
            p2Squares[index].classList.add('boom');
          }else{
            p2Squares[index].classList.add('miss');
          }
          state = false;
        }
      });
    }

    if((room.getHostName() === client.getUid())){
      //console.log(shared);
      shared.p1SquareStates.forEach((state, index) => {
        if(state == true){
          //console.log(p1Squares[index].classList);
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
          //console.log(p2Squares[index].classList);
          if(p2Squares[index].classList.contains('taken')){
            p2Squares[index].classList.add('boom');
          }else{
            p2Squares[index].classList.add('miss');
          }
          state = false;
        }
      });
    }
    
  }

  function checkP1ShipsPlaced() {
    if(!(room.getHostName() === client.getUid())){
      
      p1Ships.forEach((ship, index) => {
        //console.log(ship);
        if(shared.p1placed[index]){
          //console.log(shared);
          //console.log(ship + ' placed');
          if(!(p1ShipsPlaced[index])){
            replaceShip(shipNames[index], shared.p1ShipsPos[index]);
            //console.log(shared);
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
        //console.log(ship);
        if(shared.p2placed[index]){
          //console.log(shared);
          //console.log(ship + ' placed');
          if(!(p2ShipsPlaced[index])){
            replaceShip(shipNames[index], shared.p2ShipsPos[index]);
            //console.log(shared);
            displayGrid2.removeChild(ship);
            p2ShipsPlaced[index] = true;
          }
          
        }
      });
      
    }
  }




  ///////////////////////////////////////////////////////////////////////




  setInterval(()=> {
  displaySquare();
  }, 500);
  function entangleBegin(){
    setInterval(()=> {
      chooseEntanglePoints();
    }, 500);
  }
  function begin(){
    if(shared.entangledPoints[entangleMax-1]!= false){
      entangleButton.removeEventListener('click', entangleBegin);
      setInterval(()=> {
        playGame();
      }, 500);
    }
    else
      infoDisplay.innerHTML = 'Waiting for all ' + entangleMax + ' entangled squares'; 
  }
  
  let turnState = 'p1';
  //Game Logic
  function playGame() {
    //console.log(currentPlayer);
    if (isGameOver) return;
    if(numberOfShipsDropped>=totalShipCount){
      //infoDisplay.innerHTML = ''
      if (currentPlayer === 'p1') {
        turnDisplay.innerHTML = 'Player 1 Go';
        
        p2Squares.forEach((square, index) => square.addEventListener('click', function(e) {
        revealSquare(square, 'p1', index);
        currentPlayer = 'p2';
      }))
      
      }else if (currentPlayer === 'p2') {
        turnDisplay.innerHTML = 'Player 2 Go';
        p1Squares.forEach((square, index) => square.addEventListener('click', function(e) {
          revealSquare(square, 'p2', index);
          currentPlayer = 'p1';
        }))
      }
    }
    else if (numberOfShipsDropped<totalShipCount)
      infoDisplay.innerHTML = 'All Ships Not Placed'
    
  }
  startButton.addEventListener('click', begin);
  entangleButton.addEventListener('click', entangleBegin);

  let destroyerCount = 0;
  let submarineCount = 0;
  let cruiserCount = 0;
  let battleshipCount = 0;
  let carrierCount = 0;

  let p2DestroyerCount = 0;
  let p2SubmarineCount = 0;
  let p2CruiserCount = 0;
  let p2BattleshipCount = 0;
  let p2CarrierCount = 0;

  function displaySquare(){
    
    //console.log('fn running')
    //console.log(shared.entangledPoints)
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

  function revealSquare(square, turnState, index) {
    if (!square.classList.contains('boom') && square.classList.contains('p1')) { //p2 since player incrememnts before this check.. but it is actually checking for p1
      if (square.classList.contains('destroyer')) {destroyerCount++;}
      if (square.classList.contains('submarine')) {submarineCount++;}
      if (square.classList.contains('cruiser')) {cruiserCount++;}
      if (square.classList.contains('battleship')) {battleshipCount++;}
      if (square.classList.contains('carrier')) {carrierCount++;}
    }
    else if (!square.classList.contains('boom') && square.classList.contains('p2')) {
      if (square.classList.contains('destroyer')) {p2DestroyerCount++;}
      if (square.classList.contains('submarine')) p2SubmarineCount++;
      if (square.classList.contains('cruiser')) p2CruiserCount++;
      if (square.classList.contains('battleship')) p2BattleshipCount++;
      if (square.classList.contains('carrier')) p2CarrierCount++;
    }

    if(square.classList.contains('boom') || square.classList.contains('miss')) return;
    if (square.classList.contains('taken') && square.classList.contains('entangled') && square.classList.contains('p1')) {
      square.classList.add('boom');
      playMusic("./assets/sounds/boom.wav");
      for(let i=0; i<entangleMax; i++){
        if(square.classList.contains(i)){
          tempIndex = i;
          console.log("for p1: ", tempIndex);
          boomEntangledPair(tempIndex);
          break;
        }
      }
    }else if(square.classList.contains('taken')) { 
      square.classList.add('boom');
      playMusic("./assets/sounds/boom.wav");

      if(turnState == 'p1') {
        shared.p2SquareStates[index] = true;
      } else if(turnState == 'p2') {
        shared.p1SquareStates[index] = true;
      }

    } else {
      square.classList.add('miss');
      playMusic("./assets/sounds/miss.wav");

      if(turnState == 'p1') {
        shared.p2SquareStates[index] = true;
      } else if(turnState == 'p2') {
        shared.p1SquareStates[index] = true;
      }

    }

    //console.log(shared);
  

    // if(turnState==='p1'){
    //   if(square.classList.contains('boom') || square.classList.contains('miss')) return;
    //   if (square.classList.contains('taken') && square.classList.contains('p1')) {
    //     square.classList.add('boom');
    //   } else {
    //     square.classList.add('miss');
    //   }
    // }
    // else if(turnState==='p2'){
    //   if(square.classList.contains('boom') || square.classList.contains('miss')) return;
    //   if (square.classList.contains('taken') && square.classList.contains('p2')) {
    //     square.classList.add('boom');
    //   } else {
    //     square.classList.add('miss');
    //   }
    // }

    checkForWins();
    playGame();
  }


  




///////////////////////////////////////////////////////////////////////






  let entangleCount=0;
  let entangleMax=5;
  let paired=false;
  let i=0;
  for(let i=0;i<entangleMax;i++){
    shared.entangledPoints.push(false)
  }

  function chooseEntanglePoints(){
    
    p1Squares.forEach(square => square.addEventListener('dblclick', function(e){
      //console.log("entangle this point");
      console.log(shared.entangledPoints);
      if (square.classList.contains('taken') && !square.classList.contains('entangled') && entangleCount<entangleMax) {
        playMusic("./assets/sounds/entPlaced.wav");
        square.classList.add('entangled');
        square.classList.add(entangleCount);
        assignEntanglePair();
        entangleCount++;
        //console.log(entangleCount);
        //console.log(p1Squares.findIndex(square));
        infoDisplay.innerHTML ="";
      }else if(entangleCount>=entangleMax){
        infoDisplay.innerHTML ="You can't entangle any more, don't be greedy";
      }else if(!square.classList.contains('taken')){
        infoDisplay.innerHTML ="You're trying to entangle the sea";
      }
    }));
    // p2Squares.forEach(square => square.addEventListener('dblclick', function(e){
    //   console.log("entangle this point");
    //   square.style.backgroundColor = "grey";
    // }));
  }

  function assignEntanglePair(){
  
    for(let i=0; i<p1Squares.length; i++){
      if (p1Squares[i].classList.contains('entangled') && !p1Squares[i].classList.contains('sharedEnt')) {
        shared.entangledPoints[entangleCount]=i;
        p1Squares[i].classList.add('sharedEnt');
      }
    }
    randomPoint= Math.floor(Math.random() * (width*width));
    while(paired===false){
      if (p2Squares[randomPoint].classList.contains('taken') && !p2Squares[randomPoint].classList.contains('entangled')){
        p2Squares[randomPoint].classList.add('entangled');
        p2Squares[randomPoint].classList.add(entangleCount);
        console.log(entangleCount);
        break;
      }
      else
        randomPoint= Math.floor(Math.random() * (width*width));
    }
  }
  function boomEntangledPair(i){
    console.log("for p2: ", i);
    p2Squares.forEach(p2sqr => {
      console.log('ENTERED')
      if(p2sqr.classList.contains(i)){
        p2sqr.classList.add('boom');
        playMusic("./assets/sounds/boom.wav");
        console.log("pair is blown");
      }
    })
  }





///////////////////////////////////////////////////////////////////////






  function checkForWins() {
    if (destroyerCount === 2) {
      infoDisplay.innerHTML = 'You sunk player 1 \'s destroyer'
      destroyerCount = 10
    }
    if (submarineCount === 3) {
      infoDisplay.innerHTML = 'You sunk player 1 \'s submarine'
      submarineCount = 10
    }
    if (cruiserCount === 3) {
      infoDisplay.innerHTML = 'You sunk player 1 \'s cruiser'
      cruiserCount = 10
    }
    if (battleshipCount === 4) {
      infoDisplay.innerHTML = 'You sunk player 1 \'s battleship'
      battleshipCount = 10
    }
    if (carrierCount === 5) {
      infoDisplay.innerHTML = 'You sunk player 1 \'s carrier'
      carrierCount = 10
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
    if ((destroyerCount + submarineCount + cruiserCount + battleshipCount + carrierCount) === 50) {
      infoDisplay.innerHTML = "PLAYER 1 WINS"
      gameOver()
    }
    if ((p2DestroyerCount + p2SubmarineCount + p2CruiserCount + p2BattleshipCount + p2CarrierCount) === 50) {
      infoDisplay.innerHTML = "PLAYER 2 WINS"
      gameOver()
    }
  }
  function playMusic(url) {
    new Audio(url).play()
  }
function gameOver() {
  isGameOver = true;
  startButton.removeEventListener('click', begin);
}
}

