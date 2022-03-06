pageState = 0;

function setupPage(pageState){
    switch(pageState) {
        case 0:
            introScreenDisp();
            break;
        case 1:
            gameScreenDisp();
            break;
        case 2:
            winScreenDisp();
            break;
        default:
          // code block
    }
}
