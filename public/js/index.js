//jshint esversion:6


//Date validation for download route
const sDate = $("#startDate").change(function(){});

$("#endDate").change(function(event){
  const eDate = event.target.valueAsNumber;
  if (eDate < sDate[0].valueAsNumber) {
    alert("Bitiş tarihi başlangıç tarihinden önce olamaz.");
  }
});
