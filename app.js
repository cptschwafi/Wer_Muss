const wheel = document.getElementById("Wheel");
const GoldenArrow = document.getElementById("Golden__Arrow");
const spinBtn = document.getElementById("Spin__Btn");
const Text__Output = document.getElementById("Text__Output");
const InputContainer = document.getElementById("Input__Container");
const CloseIcon = document.getElementById("Close__Icon");
const GameContainer = document.getElementById("Game__Container");
const SadFace = document.getElementById("Sad__Face");

/* since the Golden Arrow is in a 90 deg Angle to the top of the Wheel we have to define an offset for further calculations*/ 
const RotationOffset =90;

/*Object that stores values of minimum and maximum angle which is related to one Field*/
let rotationValues = [];
/* Size of one Field of the Wheel in Degrees */
let FieldSize = 0;
/* List of Participants*/
let Participants = []

/*Fields of the Wheel*/
let Fields = [];
/*background color for each piece*/
var FieldColors = [];
/*Chart Object*/
let myChart = {};

/*VueJs App for Displaying dynamic List of Participants */
const App = Vue.createApp({
  data(){
    return {
      isMounted:0,
      ParticipantInput:'',
      ErrorMsg:'',
      participants:[]
    }
  },
  methods:{
    AddParticipant(){
      if(this.participants.length<10)
      {
        if(this.ParticipantInput.length<2)
        {
          this.ErrorMsg= "Der eingegebene Name muss mindestens 2 Buchstaben lang sein!"
        }
        else if(this.ParticipantInput.length>20)
        {
          this.ErrorMsg= "Der eingegebene Name darf maximal 20 Buchstaben lang sein!"
        }
        else
        { 
          this.ErrorMsg="";
          this.participants.push({name: this.ParticipantInput});
          this.ParticipantInput='';
        }
      }
      else
      {
        this.ErrorMsg= "Maximale Anzahl an Spielern erreicht"
      }
    },
    RemoveParticipant(participant){
      this.ErrorMsg= "";
      this.participants.splice(this.participants.indexOf(participant), 1);
    },
    StartGame(){
        /*Write List of Participants into global Variable */
        this.participants.forEach(participant => {
          Participants.push(participant.name);
        });
        /*Prepare the Game */
        PrepareGame(Participants);
      }
  }
  
});
App.mount('#Input__Container');

/* Defines which Name value is attached to which field */
function SetUpRotationValues(_ListofParticipants){
  for (let i = 0; i < _ListofParticipants.length; i++) {
    if(i == 0)
    {
      rotationValues.push( { minDegree: 1, maxDegree: FieldSize, value: _ListofParticipants[i] });
    }
    else{
      rotationValues.push( { minDegree: rotationValues[i-1].maxDegree +1, maxDegree:rotationValues[i-1].maxDegree + FieldSize, value: _ListofParticipants[i] });
    }
  }
}
/*Sets the color of each field of the wheel*/
function SetUpWheelColors(_ListofParticipants){
  /*If Number of participants dividable by 2 then give alternating colors */
  if(_ListofParticipants.length%2 ==0){
    for (let i = 0; i < _ListofParticipants.length; i++) {
      if(i == 0 || i%2 ==0)
      {
        FieldColors.push("#8b35bc");
      }
      else{
        FieldColors.push("#b163da");
      }
    }
  }
  /*if not dividable by to give all fields the same color */
  else{
    _ListofParticipants.forEach(participant => {
      FieldColors.push("#8b35bc");
    });
  }
}

/*Sets the number of fields*/
function SetUpWheelFields(_ListofParticipants){
  for (let i = 0; i < _ListofParticipants.length; i++) {
    Fields.push(FieldSize);
  }
}

/*Adjusts the font size of the Participant Names in the chart depending on the screen size */
function getFontsize()
{
  let fontsize = 0;
  if (window.innerWidth> 400 && window.innerWidth<800)
  {
    fontsize =17;
  }
  else if (window.innerWidth> 800 && window.innerWidth<1000) 
  {
    fontsize =24;
  }
  else if (window.innerWidth> 1000)
  {
    fontsize =28;
  }
  else{
    fontsize = 14
  } 
  return fontsize;
}

/*Creates the chart */
function CreateChart(){

  /*Create chart*/
  myChart = new Chart(wheel, {
  /*Plugin for displaying text on pie chart*/
  plugins: [ChartDataLabels],
  /*Set Chart Type Pie*/
  type: "pie",
  data: {
    /*set Labels(values which are to be displayed on chart)*/
    labels:Participants,
    /* setting the chart data (Names and Fieldcolors)*/
    datasets: [
      {
        backgroundColor: FieldColors,
        data: Fields 
      },
    ],
  },
  options: {
    responsive: true,
    rotation:90,
    animation: { duration: 0 },
    plugins: {
      /*hide tooltip and legend*/
      tooltip: false,
      legend: {
        display: false,
      },
      /*display labels inside pie chart*/
      datalabels: {
        color: "#ffffff",
        formatter: (_, context) => context.chart.data.labels[context.dataIndex],
        font: { size: getFontsize() },
      },
    },
  },
});
}

/*Creates the fields of the Wheel from the List of Participants */
function CreateWheel(ListofParticipants){
  /*Calculate Size of one Piece of the Wheel */
  FieldSize = 360/ ListofParticipants.length;
  SetUpRotationValues(ListofParticipants);
  SetUpWheelFields(ListofParticipants);
  SetUpWheelColors(ListofParticipants);
  CreateChart();
}

/*Hides the Input Section and shows the Wheel */
function PrepareGame(ListofParticipants){
  document.body.style.backdropFilter="blur(5px)";
  CreateWheel(ListofParticipants);
  InputContainer.style.visibility="hidden";
  GameContainer.style.display="flex";
}
 
/*displays Name of the Selected Participant*/
function DisplaySelectedParticipant (angleValue) {
  for (let i of rotationValues) {
    /*if the angleValue is between min and max then display the Name of the Winner*/
    if (angleValue >= i.minDegree && angleValue <= i.maxDegree) {
      /*Show Sad Face Image */
      if(window.innerWidth>774)
      {
        SadFace.style.display="block";
      }
      Text__Output.innerHTML = `<p> ${i.value} muss!</p>`;
      spinBtn.disabled = false;
      break;
    }
  }
};

/*Spins the Wheel and selects the "Winner" */
function SpinWheel(){
  /*Hide Sad Face Image */
  SadFace.style.display="none";

   /*Number of Rotations the Wheel has completed*/
   let RotationsCompleted = 0;
   /*Wheel Rotation Speed*/
   let rotationSpeed = 101;
 
   spinBtn.disabled = true;
   /*Display Good Luck Message*/
   Text__Output.innerHTML = `<p>Viel Glück !</p>`;
   /*Generate random degree to stop at*/
   let randomDegree = Math.floor(Math.random() * 360);
 
   /*Interval for rotation animation*/
   let rotationInterval = window.setInterval(() => {
     /*Set rotation for piechart
     Initially to make the piechart rotate faster we set rotationSpeed to 101 so it rotates 101 degrees at a time and this reduces by 5 with every count. Eventually on last rotation we rotate by 1 degree at a time.
     */
     myChart.options.rotation = myChart.options.rotation - rotationSpeed;
     /*Update chart with new value;*/
     myChart.update();
     /*If rotation is 0 reset it back to 360*/
     if (myChart.options.rotation <= 0+ RotationOffset) {
       RotationsCompleted += 1;
       rotationSpeed -= 5;
       myChart.options.rotation = 360 + RotationOffset;
     } 
     if (RotationsCompleted > 15 && (360 + RotationOffset -myChart.options.rotation) == randomDegree) {
       DisplaySelectedParticipant(randomDegree);
       clearInterval(rotationInterval);
       RotationsCompleted = 0;
       rotationSpeed = 101;
     }
   }, 10);
}
function CloseWindow(){
  /*Hide Game Container */
  GameContainer.style.display="none";
  /*Show Input Container */
  InputContainer.style.visibility="visible";
  /*Hide Sad Face Image */
  SadFace.style.display="none";
  /*Destroy Chart Object */
  myChart.destroy();
  /*Reset Chart Values */
  ResetValues();
}
function ResetValues(){
  Participants=[];
  rotationValues = [];
  FieldSize = 0;
  Fields = [];
  FieldColors = [];
  Text__Output.innerHTML = ``;
}

spinBtn.addEventListener("click", () => {SpinWheel();});
CloseIcon.addEventListener("click", () => {CloseWindow();});
GoldenArrow.addEventListener("click", () => {SpinWheel();});
