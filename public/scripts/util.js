const setTime = (elem, ms) => {
  let sec = ms / 1000;
  let min = sec / 60;
  let hrs = min / 60;

  ms = Math.floor((ms / 10) % 100);
  sec = Math.floor(sec % 60);
  min = Math.floor(min % 60);
  hrs = Math.floor(hrs); 

  const template = (num, letter) => `
  <span class="time__number" data-letter="${letter}">${num < 10? "0" + num: num}</span><span class="time__letter">${letter}</span>
  `;

  const missingLetter = letter => $(elem).find(`span[data-letter="${letter}"]`).length === 0;

  let valid = true;
  if(hrs > 0 && missingLetter("h")) valid = false;
  if(min > 0 && missingLetter("m")) valid = false;
  if(missingLetter("s")) valid = false;
  if(missingLetter("")) valid = false;
  
  if(valid) {
    const setLetter = (val, letter) => $(elem).find(`span[data-letter="${letter}"]`).text(val < 10? "0" + val: val);

    if(hrs > 0) setLetter(hrs, "h");
    if(min > 0) setLetter(min, "m");
    setLetter(sec, "s");
    setLetter(ms, "");
  } else {
    let html = "";
    if(hrs > 0) html += template(hrs, "h");
    if(min > 0) html += template(min, "m");
    html += template(sec, "s");
    html += template(ms, "");
    $(elem).html(html);
  }
}

const inited = new Set();
const init = (name, save) => {
  name = encodeURIComponent(name);
  if(inited.has(name)) return;
  inited.add(name);

  if(save) $.post(`/api/${username}/${name}`)
    .then(() => console.log(`Saved ${name}`));

  data[name] = data[name] || [];
  state[name] = state[name] || {
    time: 0,
    last: -1,
    playing: false
  }


  $("#timers").append(`
  <div class="timer" data-tag="${name}">
    <button class="btn btn--delete" data-tag="${name}">X</button>
    <div class="playbtn-wrapper">
      <button class="playbtn" data-tag="${name}"></button>
    </div>
    <div class="timer__tag">
      <span>${name}</span>
    </div>
    <div class="timer__seperator"></div>
    <div class="time" data-tag="${name}">
    </div>
  </div>
  `);


  setTime($(`.time[data-tag="${name}"]`), state[name].time);

  $(`.btn--delete[data-tag="${name}"`).click(() => {
    const val = confirm("Are you sure?");
    if(val) {
      $.ajax({
        url: `/api/${username}/${name}`,
        type: "DELETE"
      }).then(() => console.log(`Removed ${name}`));

      $(`.timer[data-tag="${name}"]`).remove();
      inited.delete(name);

      delete state[name];
      delete data[name];
    }
  });

  $(`.playbtn[data-tag="${name}"]`).click(function() {
    $(this).toggleClass("paused");

    const opt = $(this).hasClass("paused") ? "play": "pause";

    const tag = $(this).data("tag");
    const time = Date.now();
    state[tag].playing = opt === "play";

    if(!state[tag].playing){
      state[tag].time += time - state[tag].last;
      setTime($(`.time[data-tag="${tag}"]`), state[tag].time);
    }
    state[tag].last = time;

    $.post(`/api/addTime/${username}/${name}`, {opt, time})
      .then(() => console.log(`Saved ${opt} at time ${time}`));

      data[tag].push({
      time,
      opt
    });
  });
}