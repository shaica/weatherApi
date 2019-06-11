//jshint esversion:6

exports.getDate = function() {
  const today = new Date().toLocaleFormat("%e %B %Y");
  const options = {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  };

  return today.toLocaleDateString('en-US', options);

};

exports.getDay = function() {
  const today = new Date().getDay();
  switch (today) {
    case 0:
      day = "Pazar";
      break;

    case 1:
      day = "Pazartesi";
      break;

    case 2:
      day = "Salı";
      break;

    case 3:
      day = "Çarşamba";
      break;

    case 4:
      day = "Perşembe";
      break;

    case 5:
      day = "Cuma";
      break;

    case 6:
      day = "Cumartesi";
      break;
  }
  return day;

};

exports.getTime = function() {
  const options = {
    hour12: false
  };
  const time = new Date().toLocaleTimeString('tr', options);
  return time;
};
