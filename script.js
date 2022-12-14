class Cell{
    // A class to represent each square in the game's grid
    // and method to interac with them.
    constructor(xPos, yPos, grid, container){
        this.xPos = xPos;
        this.yPos = yPos;
        this.grid = grid;
        this.container = container;
        // Square states: mines, marked and mineCount(explored).
        this.mine = false;
        this.marked = false;
        this.mineCount = false;
        this.mineChecker = 0;
        // Div creation and insertion in the DOM.
        this.div = document.createElement("div");
        this.container.insertAdjacentElement("beforeend", this.div);
        this.div.style.left = `${this.xPos*27}px`;
        this.div.style.top = `${this.yPos*27}px`;
        this.div.dataset.cellName = `${this.xPos}, ${this.yPos}`;
    }
    get getMine(){
        return this.mine;
    }
    set setMine(boolean){
        this.mine = boolean;
    }
    explore = () =>{
        // This method reveals what it is in the square.
        if(this.marked === false){
            // If there's a mine the game is over.
            if(this.getMine === true){
                this.div.style.backgroundColor = "red";
                this.grid.lose(); 
            // Else a number with the square's adjacents mines is revealed.
            }else{
                if(this.mineCount === false){
                    this.div.style.backgroundColor = "#D9D9D9";
                    Grid.cellsRevealed += 1;
                    this.mineCount = 0;
                    // For loops to explore the cells in the range -1/+1 of the cell
                    // in the x and y axis.
                    for(let y = -1; y < 2; y+=1){
                        for(let x = -1; x < 2; x+=1){
                            // If clause for preventing the cell that invokes the function to be checked
                            if(x !== 0 || y !== 0){
                                var tempX = this.xPos+x;
                                var tempY = this.yPos+y;
                                // Clause to not explore cells outside the grid
                                if((tempX >= 0 && tempY >= 0)&&(tempX < this.grid.width && tempY < this.grid.height)){
                                    var temp = Grid.cellRegister[`${tempX}, ${tempY}`];
                                    if(temp.getMine === true){
                                        this.mineCount += 1;
                                    }
                                }
                            }
                        }
                    }
                    // If there's no adjacent mines the method keep exploring 
                    // until finds cells with adjacent mines 
                    // or all the cells that do not are revealed.
                    if(this.mineCount > 0){
                        this.div.innerText = `${this.mineCount}`;
                        this.div.style.color = Grid.colors[`${this.mineCount}`];
                    }else{
                        this.exploreAround();
                    }
                }
            }    
        }
        this.grid.checkWin();
    }
    mark = () =>{
        // This method flags a square as mined square,
        // therefore is prevented by being explored.
        if(this.marked === false && this.mineCount === false){
            this.div.style.backgroundColor = "orange";
            this.marked = true;
        // Clause to remove the flag.
        }else if(this.mineCount === false){
            this.div.style.backgroundColor = "grey";
            this.marked = false;
        }  
    }
    exploreAround = () =>{
        // Function for exploring all the cells containing no mines around surronding this cell.
        
        // First check that the required number of adjacents cell have been marked with mines
        // if not do not allow exploreAround
        var tempMarker = 0;
            for(let y1 = -1; y1 < 2; y1+=1){
                for(let x1 = -1; x1 < 2; x1+=1){
                    var tempX1 = this.xPos+x1;
                    var tempY1 = this.yPos+y1;  
                    if((x1 !== 0 || y1 !== 0)&&(tempX1 >= 0 && tempY1 >= 0) && 
                    (tempX1 < this.grid.width && tempY1 < this.grid.height)){
                        if(Grid.cellRegister[`${tempX1}, ${tempY1}`].marked === true){
                            tempMarker +=1;
                        }
                    }
                }
            }  
        if(tempMarker === this.mineCount){
            for(let y = -1; y < 2; y+=1){
                // For loops to explore the 8 adjacents cells.
                for(let x = -1; x < 2; x+=1){
                    var tempX = this.xPos+x;
                    var tempY = this.yPos+y;
                    // If clause to prevent the cell from exploring itself and/or outside the grid.
                    if((x !== 0 || y !== 0)&&(tempX >= 0 && tempY >= 0) && 
                    (tempX < this.grid.width && tempY < this.grid.height)){
                        // Base case
                        Grid.cellRegister[`${tempX}, ${tempY}`].explore();
                        // If clause to prevent the recursive call to be exploring the same cells infinitely
                        // by adding the cells explored to a class variable and preventing the function to reexploring them.
                        if(Grid.cellRegister[`${tempX}, ${tempY}`].mineCount === 0 && 
                        !(Grid.cellsExplored[`${tempX}, ${tempY}`]===true)){
                            Grid.cellsExplored[`${tempX}, ${tempY}`] = true;
                            // Recursive call
                            Grid.cellRegister[`${tempX}, ${tempY}`].exploreAround();
                        }
                    }
                }
            }
        }
    }
}
class Grid{
    // Class to define the size and number of mines in the game,
    // draw the grid, 
    // keep track of the game status: win conditions, timer;
    // and to call win and lose methods.
    static cellRegister = {};
    static cellsRevealed = 0;
    static colors = {1: "blue", 2: "green", 3: "yellow", 4: "#0800A1", 5:"#DB0066", 6:"#30B0B3", 7:"purple", 8:"grey"};
    static cellsExplored = {};
    static gameOver = false;
    constructor(name, width, height, numMines, container){
        this.name = name;
        this.width = width;
        this.height = height;
        this.numMines = numMines;
        this.container = container;
        this.squaresArray = [];
        this.minesArray = [];
        this.goal = this.width * this.height - this.numMines;
        this.timer = new Timer(this.container);
        this.timer.startTimer();
        this.grid = this;
    }
    get getNumMines(){
        return this.numMines;
    }
    get getSquaresArray(){
        return this.squaresArray;
    } 
    set setSquaresArray(array){
        this.squaresArray = array;
    }
    get getMinesArray(){
        return this.minesArray;
    }
    set setMinesArray(array){
        this.minesArray = array;
    }
    // addGrid = (grid) => {
    //     this.grid = grid;
    // }
    // Function necesary for sorting numerics arrays.
    compareNumbers = (a,b) =>{
        return a - b;
    }
    seedMines = () =>{
        // Here we build two arrays to randomly select {numMines} squares to be mined
        // First we create an array with a number corresponding with every square
        for(let i = 0; i < this.height*this.width; i++){
            this.squaresArray.push(i);
        }
        // We select as many squares as mines are from the squares array
        // and we remove them from the squares array.
        for(let i = 0; i < this.getNumMines; ++i){
            var selected = Math.floor(Math.random()*this.squaresArray.length);
            var temp = this.squaresArray.splice(selected,1);
            // We add them to the minesArray
            this.minesArray.push(temp.pop());            
        }
        this.minesArray.sort(this.compareNumbers);
    }
    drawGrid = ()=> {
        var counter = 0;
        // For loop to assining mines to the corresponding cells.
        for(let y = 0; y < this.height; y++){
            for(let x = 0; x < this.width; x++){
                Grid.cellRegister[`${x}, ${y}`] = new Cell(x, y, this.grid, this.container);
                if(counter === this.minesArray[0]){
                    Grid.cellRegister[`${x}, ${y}`].setMine = true;
                    counter +=1;
                    this.minesArray.shift();
                }else{
                    counter +=1;
                }
            }
        }
    }
    checkWin = () =>{
        if(Grid.cellsRevealed === this.goal){
            this.time = this.timer.stopTimer();
            this.container.innerHTML = "";
            var winMessage = document.createElement("h1");
            winMessage.innerText = `You win and your best time is ${localStorage.getItem(`${this.name}`)}`;
            this.container.insertAdjacentElement("beforeend", winMessage);     
        }
        if(!localStorage.getItem(`${this.name}`)){
            localStorage.setItem(`${this.name}`, this.time);
        }else if(localStorage.getItem(`${this.name}`) > this.time){
            localStorage.setItem(`${this.name}`, this.time);
        }
    }
    lose = () =>{
        // Logic for ending the game losing
        // Reveal all mines
        for(var y = 0; y < this.height; y +=1){
            for(var x = 0; x < this.width; x +=1){
                if(Grid.cellRegister[`${x}, ${y}`].getMine=== true){
                    Grid.cellRegister[`${x}, ${y}`].div.style.backgroundColor = "red";
                }
            }
        }
        const keys = Object.keys(Grid.cellRegister);
        var mesY = Grid.cellRegister[keys[keys.length-1]].yPos;
        var loseMessage = document.createElement("h1");
        loseMessage.innerText = "You lose";
        this.container.insertAdjacentElement("beforeend", loseMessage);
        loseMessage.style.marginTop = `${mesY*27+40}px`;
        Grid.gameOver = true;
        this.timer.stopTimer();
    }
}
class StartButton{
    // Class to create the buttons for starting the game.
    constructor(name, width, height, mines, container){
        this.name = name;
        this.width = width;
        this.height = height;
        this.mines = mines;
        this.container = container;
        this.button = document.createElement("button");
        this.button.innerText = name.charAt(0).toUpperCase() + name.slice(1);
        this.button.onclick = () =>{
            resetGame();
            newGame(this.name, this.width, this.height, this.mines, this.container);
        }
        const header = document.querySelector("header");
        header.insertAdjacentElement("beforeend", this.button);       
    }
}
class Timer{
    // Class to keep track of the time used to finish the game.
    constructor(container){
        this.container = container;
        this.start = 0;
        this.timer = document.createElement("h4");
        container.insertAdjacentElement("afterbegin", this.timer);
        this.timer.innerText = 0;
    }
    startTimer(){
        this.start = Date.now();
        this.intervalID = setInterval(()=>{    
            this.timer.innerText = Math.floor((Date.now()-this.start)/1000);
        }, 1000);
    }
    stopTimer(){
        this.time = this.timer.innerText;
        clearInterval(this.intervalID);
        return this.time;
    }
}
function logClick(e){
    // Function to know where the user clicks and call functions acordingly.
    const element = e.target;
    if(e.buttons){
    if(e.buttons === 1 && Grid.gameOver === false){
        Grid.cellRegister[`${element.dataset.cellName}`].explore();
    }
    else if(e.buttons === 2 && Grid.gameOver === false){ 
        
        Grid.cellRegister[`${element.dataset.cellName}`].mark(); 
    }
    else if(e.buttons === 3 && Grid.gameOver === false){
        Grid.cellRegister[`${element.dataset.cellName}`].exploreAround();  
    }}
}
function newGame(name, width, height, mines, container){
    // Wrap up function to start the game.
    var field = new Grid(name, width, height, mines, container);    
    // field.addGrid(field);
    field.seedMines();
    field.drawGrid();
}
function resetGame(){
    // Wrap up function to reset the game.
    // Remove all the div and create buttons again
    document.querySelector("#container").innerHTML = "";
    // Reset class variables.
    Grid.cellRegister = {};
    Grid.cellsExplored = {};
    Grid.cellsRevealed = 0;
    Grid.gameOver = false;
}
window.onload = function init(){

    document.addEventListener("mousedown", event => logClick(event));
    // Disabling the call to the right click menu
    window.addEventListener('contextmenu', function (e) {  
        e.preventDefault(); 
      }, false);
    const container = document.querySelector("#container");
    
    var easy = new StartButton("easy", 8, 8, 2, container);
    var medium = new StartButton("medium", 14, 10, 26, container);
    var hard = new StartButton("hard", 18, 12, 48, container);
}